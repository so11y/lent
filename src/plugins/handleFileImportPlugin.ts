import { parse, init } from 'es-module-lexer';
import { importFileHash, sliceFileDotName } from '../share';
import { LentPlugin } from './preCompose';

export const handleFileImportPlugin: LentPlugin = (l) => {
	l.plugin.addPlugins({
		name: 'handleFileImportPlugin',
		exits: ['.js', '.ts', '.tsx'],
		async transform(v, file, i) {
			await init;
			const [imports] = parse(v);
			const dependModule = i.depend.getDepend(file.requestUrl);
			dependModule.importFile = [...imports];

			return imports.reduce((prev, next) => {
				if (next) {
					const importStr = v.substring(next.ss, next.se);
					const childModule = i.depend.getDepend(sliceFileDotName(next.n));
					if (childModule && childModule.hash) {
						return prev.replace(
							importStr,
							importFileHash(importStr, childModule.hash)
						);
					}
					return prev;
				}
				return prev;
			}, v);
		}
	});
};
