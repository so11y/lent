import { PartialResolvedId } from 'rollup';
import { resolve } from 'path';
import { existsSync } from 'fs';
import { Plugin } from '../../../types/plugin';
import { Lent } from '..';

export const tryFsResolve = (fsPath: string, exits: Array<string>) => {
	return exits
		.map((exit) => `$${fsPath}${exit}`)
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
		resolveId(id: string) {
			let res: string | PartialResolvedId | undefined;
			const fsPath = resolve(lent.config.root, id.slice(1));
			if ((res = tryFsResolve(fsPath, lent.config.extensions))) {
				return res;
			}
		}
	};
};
