import { Loader, transform } from 'esbuild';
import { extname } from 'path';
import { createFilter } from '@rollup/pluginutils';
import { Plugin } from '../../../types/plugin';
import { cleanUrl } from '../../utils';
import { Lent } from '..';

export function esbuildPlugin(): Plugin {
	const filter = createFilter(/\.(tsx?|jsx|ts)$/, /\.js$/);
	let lent: Lent;
	return {
		name: 'lent:esbuild',
		enforce: 'post',
		serveStart(lentInstance) {
			lent = lentInstance;
		},
		async transform(code, id) {
			if (filter(id) || filter(cleanUrl(id))) {
				const loader = extname(id).slice(1) as Loader;
				const result = await transform(code, {
					sourcemap: 'inline',
					sourcefile: id,
					loader,
					define: lent.config.define
				});
				return result.code;
			}
		}
	};
}
