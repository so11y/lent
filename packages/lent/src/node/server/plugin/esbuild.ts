import { Loader, transform } from 'esbuild';
import { extname } from 'path';
import { createFilter } from '@rollup/pluginutils';
import { Plugin } from '../../../types/plugin';
import { cleanUrl } from '../../utils';

export function esbuildPlugin(): Plugin {
	const filter = createFilter(/\.(tsx?|jsx|ts)$/, /\.js$/);

	return {
		name: 'lent:esbuild',
		enforce:"post",
		async transform(code, id) {
			if (filter(id) || filter(cleanUrl(id))) {
				const loader = `.${extname(id)!}` as Loader;
				const result = await transform(code, {
					sourcemap: 'inline',
					sourcefile: id,
					loader
				});
				return result.code;
			}
		}
	};
}

