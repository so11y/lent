import { ImportSpecifier } from 'es-module-lexer';
import { normFileStarwith } from './share';
import { LentHttpInstance } from './types';

export interface LentModuleDepends {
	importFile: Array<ImportSpecifier>;
	etag: string;
	requestUrl: string;
	hash: string;
}

export const createLentModuleDepend = <T extends Partial<LentModuleDepends>>(
	m: T
): T => {
	return {
		etag: '',
		requestUrl: '',
		importFile: [],
		hash: '',
		...m
	};
};

export const depends = (): LentHttpInstance['depend'] => {
	const dependGraph = new Map<string, LentModuleDepends>();
	return {
		getGraph: () => dependGraph,
		getDepend: (fileName: string) => dependGraph.get(fileName),
		addDepend(fileName: string, lentModule: LentModuleDepends) {
			if (!dependGraph.has(fileName)) {
				dependGraph.set(fileName, lentModule);
			}
		}
	};
};

export const getdependsParent = (
	moduleFileName: string,
	depends: LentHttpInstance['depend']
): Array<string> => {
	const depMap = depends.getGraph();
	const findParents = [];
	const walkDepend = (fileName: string) => {
		for (const [modulePath, moduleValue] of depMap) {
			if (modulePath !== fileName) {
				const haveParent = moduleValue.importFile.some(
					(i) => i.n === normFileStarwith(fileName)
				);
				if (haveParent) {
					findParents.unshift(modulePath);
					walkDepend(modulePath);
				}
			}
		}
	};
	walkDepend(moduleFileName);
	return findParents;
};

export const setDependsAddHash = (
	fileNames: Array<string>,
	depends: LentHttpInstance['depend']
) => {
	fileNames.forEach((v) => {
		const fileDepend = depends.getDepend(v);
		if (fileDepend) {
			fileDepend.hash = Date.now().toString();
		}
	});
};
