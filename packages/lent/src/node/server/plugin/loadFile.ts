import { existsSync, readFileSync } from 'fs';
import { Plugin } from '../../../types/plugin';
import { cleanUrl } from '../../../node/utils';

export const loadFilePlugin = (): Plugin => {
	return {
		name: 'lent:loadFile',
		enforce: 'post',
		load(id: string) {
			if (id && existsSync(id)) {
				return readFileSync(cleanUrl(id)).toString();
			}
		}
	};
};
