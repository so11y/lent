import { Plugin } from '../../../types/plugin';
import { parse, init, ImportSpecifier } from 'es-module-lexer';
import { Lent } from '../index';
import MagicString from 'magic-string';
import { ComposeCondition, Mode } from '@lent/link';
import { ModuleNode } from '../moduleGraph';
import glob from 'fast-glob';
import { join } from 'path';

interface ImportMetaContext {
	continueHere: boolean;
	source: string;
	specifier: ImportSpecifier;
	s: MagicString;
	mod: ModuleNode;
	lent: Lent;
}

const handleImportMetaHot = {
	maybe(meta: ImportMetaContext) {
		const { source, specifier, mod } = meta;
		const { s: start, e: end } = specifier;
		const prop = source.slice(end, end + 4);
		const rawUrl = source.slice(start, end);
		return (
			rawUrl === 'import.meta' &&
			prop === '.hot' &&
			source.slice(end + 4, end + 11) === '.accept'
		);
	},
	expect(meta: ImportMetaContext) {
		const { mod } = meta;
		mod.isSelfAccepting = true;
	}
};
const handleImportGlob = {
	maybe(meta: ImportMetaContext) {
		const { source, specifier, mod } = meta;
		const { s: start, e: end } = specifier;
		const prop = source.slice(end, end + 4);
		const rawUrl = source.slice(start, end);
		return (
			rawUrl === 'import.meta' && prop === '.glo' && source[end + 4] === 'b'
		);
	},
	expect(meta: ImportMetaContext) {
		const { source, specifier, lent, s } = meta;
		const { s: start, e: end } = specifier;
		const globIndex = end + 6;
		const endIndex = source.indexOf(`)`, globIndex);
		const pattern = source.slice(globIndex + 1, endIndex - 1);
		const files = glob.sync(pattern, {
			cwd: lent.config.root,
			ignore: ['**/node_modules/**']
		});
		const overwriteCode = new MagicString('');
		overwriteCode.prepend('{');
		files.forEach((file) =>
			overwriteCode.append(`'${file}':()=>import('${file}'),`)
		);
		overwriteCode.append('}');
		s.overwrite(start, endIndex + 1, overwriteCode.toString());
	}
};

const overwritePath = (
	id: string,
	rawUrl: string,
	lent: Lent
): [boolean, string] => {
	if (id.includes('/node_modules/')) {
		return [true, join('/node_modules/', rawUrl)];
	}
	return [false, id.replace(lent.config.root, '')];
};

const handleImportMate = (mate: ImportMetaContext) => {
	return new ComposeCondition<ImportMetaContext>(Mode.IfElse)
		.use(handleImportMetaHot)
		.use(handleImportGlob)
		.run(mate);
};

export const importAnalysisPlugin = (): Plugin => {
	let lent: Lent;
	return {
		name: 'lent:importAnalysis',
		enforce: 'post',
		configureServer(lentInstance) {
			lent = lentInstance;
		},
		async transform(source, importer) {
			if (importer.endsWith('client.js')) return;
			await init;
			const [imports] = parse(source);
			const importerModule = lent.moduleGraph.getModulesByFile(importer)!;
			const s = new MagicString(source);
			const importers = new Set<string>();
			importerModule.isSelfAccepting = false;
			if (imports.length) {
				for (let index = 0; index < imports.length; index++) {
					const { s: start, e: end } = imports[index];
					const rawUrl = source.slice(start, end);
					const importContext: ImportMetaContext = {
						continueHere: false,
						source,
						specifier: imports[index],
						mod: importerModule,
						s,
						lent
					};
					handleImportMate(importContext);
					if (importContext.continueHere) continue;
					//  if (prop === '.env') {
					// }
					// const resolved = await this.resolve(rawUrl, importer)
					const resolved = await this.resolve(rawUrl, importer);
					if (resolved) {
						const [isExternal, urlWithoutBase] = overwritePath(
							resolved.id,
							rawUrl,
							lent
						);
						const childModule = await lent.moduleGraph.ensureEntryFromUrl(
							urlWithoutBase
						);
						childModule.isExternal = isExternal;
						if (childModule) {
							s.overwrite(
								start,
								end,
								`${childModule.url}${childModule.injectLastHMRTimestamp}`
							);
						}
						importers.add(childModule.url);
					}
				}
				if (importerModule.isSelfAccepting) {
					s.prepend(
						`import { createHotContext } from "/@lent/client";import.meta.hot = createHotContext('${importerModule.url}');`
					);
				}
				lent.moduleGraph.updateModuleInfo(importerModule, importers);
				return s.toString();
			}
		}
	};
};
