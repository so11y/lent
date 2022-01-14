import { ImportSpecifier } from 'es-module-lexer';
import { normFileStarwith } from './share';
import { LentHttpInstance } from './types';

export interface LentModuleDepends {
	importFile: Array<ImportSpecifier>;
	etag?: string;
	requestUrl?: string;
}

export const createLentModuleDepend = <T extends LentModuleDepends>(
	m: T
): T => {
	return {
		etag: '',
		requestUrl: '',
		...m
	};
};

export const depends = (): LentHttpInstance['depend'] => {
	const dependGraph = new Map<string, LentModuleDepends>();
	return {
		getGraph: () => dependGraph,
		getDepend: (fileName: string) => dependGraph.get(fileName),
		addDepend(fileName: string, lentModule: LentModuleDepends) {
			dependGraph.set(fileName, lentModule);
		}
	};
};

export const getdependsParent = (
	moduleFileName: string,
	depends: LentHttpInstance['depend']
) => {
	const depMap = depends.getGraph();
	for (const [modulePath, moduleValue] of depMap) {
		if (modulePath !== moduleFileName) {
			const haveParent = moduleValue.importFile.some(
				(i) => i.n === normFileStarwith(moduleFileName)
			);
			if (haveParent) {
				return modulePath;
			}
		}
	}
	return null;
};
