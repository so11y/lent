import { PartialResolvedId } from 'rollup';
import { resolve } from 'path';
import { existsSync } from 'fs';
import { Plugin } from '../../../types/plugin';
import { Lent } from '../index';
import { cleanInternalUrl, handleInternal } from '../../../node/utils';

export const tryFsResolve = (fsPath: string, exits: Array<string>) => {
	if (existsSync(fsPath)) {
		return fsPath;
	}
	return exits
		.map((exit) => `${fsPath}${exit}`)
		.find((path) => existsSync(path));
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
			if (isInternal) {
				return resolve(
					require.resolve('lent'),
					`../${cleanInternalUrl(url)}.js`
				);
			}
			const fsPath = resolve(importer, `../${id}`);
			if ((res = tryFsResolve(fsPath, lent.config.extensions))) {
				return res;
			}
		}
	};
};
