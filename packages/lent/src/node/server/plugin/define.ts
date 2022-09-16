import { Lent } from '../index';
import { Plugin } from '../../../types/plugin';

export const definePlugin = (): Plugin => {
	let lent: Lent;
	return {
		name: 'lent:define',
		enforce: 'pre',
		configureServer(lentInstance) {
			lent = lentInstance;
		},
		transform(code) {
			if (!code) return '';
			const define = lent.config.define;
			return Object.keys(lent.config.define).reduce((prevCode, key) => {
				return prevCode.replace(new RegExp(`/${key}/g`), define[key]);
			}, code);
		}
	};
};
