import { PartialResolvedId } from 'rollup';
import { resolve, join } from 'path';
import { existsSync } from 'fs';
import { Plugin } from '../../../types/plugin';
import { Lent } from '../index';
import {
	cleanInternalUrl,
	handleInternal,
	isExternal
} from '../../../node/utils';
import { getPackageInfoSync } from 'local-pkg';

export const tryFsResolve = (fsPath: string, exits: Array<string>) => {
	if (existsSync(fsPath)) {
		return fsPath;
	}
	return exits
		.map((exit) => `${fsPath}${exit}`)
		.find((path) => existsSync(path));
};

const getPckPath = (id: string, root: string) => {
	const filePackage = getPackageInfoSync(id);
	if (filePackage) {
		const fileRoot =
			filePackage.packageJson.module || filePackage.packageJson.main;
		return resolve(filePackage.packageJsonPath, `../${fileRoot}`);
	}
};

export const resolvePlugin = (): Plugin => {
	let lent: Lent;
	return {
		name: 'lent:resolve',
		enforce: 'post',
		serveStart(lentInstance) {
			lent = lentInstance;
		},
		resolveId(id: string, importer: string) {
			let res: string | PartialResolvedId | undefined;
			const [url, isInternal] = handleInternal(id);
			const mod = lent.moduleGraph.urlToModuleMap.get(id);
			if (mod) return mod.file;
			if (isInternal) {
				return resolve(
					require.resolve('lent'),
					`../${cleanInternalUrl(url)}.js`
				);
			}
			if (isExternal(id)) {
				return getPckPath(id, lent.config.root);
			}
			if (id.includes('/node_modules/')) {
				const splitPath = id.split('/').filter(Boolean);
				const modulesIndex = splitPath.findIndex((v) => v === 'node_modules');
			  return getPckPath(splitPath.slice(modulesIndex + 1).join("/"), lent.config.root);
			}
			const fsPath = resolve(importer, `../${id}`);
			if ((res = tryFsResolve(fsPath, lent.config.extensions))) {
				return res;
			}
		}
	};
};
