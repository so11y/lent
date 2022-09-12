import { existsSync, readFileSync } from 'fs';
import { Lent } from '..';
import { Plugin } from '../../../types/plugin';

export const clientPlugin = (): Plugin => {
	let lent: Lent;
	return {
		name: 'lent:client',
		enforce: 'pre',
		configureServer(lentInstance) {
			lent = lentInstance;
		},
		transform(code: string, id: string) {
			if (id.endsWith('client.js')) {
				return code.replace('__lent__socket_port', lent.config.port.toString());
			}
		}
	};
};
