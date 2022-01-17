import { parse, init } from 'es-module-lexer';
import {
	getLastFileName,
	importFileHash,
	isNodeModuleFile,
	sliceFileDotName
} from '../share';
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
					let resultFile = prev;
					const importStr = v.substring(next.ss, next.se);
					const [lastModulePath] = getLastFileName(file.requestUrl);

					const childModule = i.depend.getDepend(
						sliceFileDotName(lastModulePath) + sliceFileDotName(next.n)
					);

					if (childModule && childModule.hash) {
						resultFile = resultFile.replace(
							importStr,
							importFileHash(importStr, childModule.hash)
						);
					}

					if (isNodeModuleFile(next.n)) {
						resultFile = resultFile.replace(next.n, `/@lent/${next.n}`);
					}

					return resultFile;
				}
				return prev;
			}, v);
		}
	});
};
