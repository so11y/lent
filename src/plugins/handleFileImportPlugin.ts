import { parse, init } from 'es-module-lexer';
import MagicString from 'magic-string';
import { sliceFileDotName, isNodeModuleFile } from '../share';
import { LentPlugin } from './preCompose';

export const handleFileImportPlugin: LentPlugin = (l) => {
	l.plugin.addPlugins({
		name: 'handleFileImportPlugin',
		exits: ['.js', '.ts', '.tsx', '.mjs', '.mts'],
		async transform(v, file, i) {
			await init;
			const [imports] = parse(v);
			const dependModule = i.depend.getDepend(file.requestUrl);
			dependModule.importFile = [...imports];
			const s = new MagicString(v);
			imports.forEach((importItem) => {
				const childModule = i.depend.getDepend(sliceFileDotName(importItem.n));
				if (childModule && childModule.hash) {
					s.overwrite(
						importItem.s,
						importItem.e,
						`${importItem.n}?t=${childModule.hash}`
					);
				}
				if (isNodeModuleFile(importItem.n)) {
					s.overwrite(importItem.s, importItem.e, `/@lent/${importItem.n}`);
				}
			});
			return s.toString();
		}
	});
};
