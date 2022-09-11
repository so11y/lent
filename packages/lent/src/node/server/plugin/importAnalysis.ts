import { Plugin } from '../../../types/plugin';
import { parse, init } from 'es-module-lexer';
import { Lent } from '../index';
import { handleInternal } from 'src/node/utils';
import MagicString from 'magic-string';
import { resolve } from 'path';

export const importAnalysisPlugin = (): Plugin => {
	let lent: Lent;
	return {
		name: 'lent:importAnalysis',
		enforce: 'post',
		serveStart(lentInstance) {
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
					if (rawUrl === 'import.meta') {
						const prop = source.slice(end, end + 4);
						if (prop === '.hot') {
							if (source.slice(end + 4, end + 11) === '.accept') {
								importerModule.isSelfAccepting = true;
							}
						}
						// else if (prop === '.env') {
						// } else if (prop === '.glo' && source[end + 4] === 'b') {
						// }
						// const resolved = await this.resolve(rawUrl, importer)
						continue;
					}
					const resolved = await this.resolve(rawUrl, importer);
					if (resolved) {
						const urlWithoutBase = resolved.id.replace(lent.config.root, '');
						const childModule = await lent.moduleGraph.getModulesByFile(
							urlWithoutBase
						);
						if (childModule && childModule.lastHMRTimestamp) {
							s.overwrite(
								start,
								end,
								`${urlWithoutBase}?t=${childModule.lastHMRTimestamp}`
							);
						}
						importers.add(urlWithoutBase);
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
