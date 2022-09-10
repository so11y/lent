import { existsSync, readFileSync } from 'fs';
import { Plugin } from '../../../types/plugin';

export const clientPlugin = (): Plugin => {
	return {
		name: 'lent:client',
		enforce: 'pre',
		load(id: string) {

      console.log(id);
    }
	};
};
