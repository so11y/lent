import path from 'path';
import typeScriptPlugin from 'rollup-plugin-typescript2';
import rollupPluginReplace from '@rollup/plugin-replace';
const pkg = require(path.resolve(__dirname, `./package.json`));

const isDev = process.env.LENT_DEV === 'dev';

const banner = `/*!
* ${pkg.name} v${pkg.version}
* (c) ${new Date().getFullYear()} ${pkg.author.name}
* @license MIT
*/`;

const replaces = () => {
	const replacesKey = {
		__DEV__: false
	};
	Object.keys(replacesKey).forEach((key) => {
		if (key in process.env) {
			replacesKey[key] = process.env[key];
		}
	});
	return rollupPluginReplace({
		preventAssignment: true,
		values: replacesKey
	});
};

export default {
	input: './src/node/server/index.ts',
	plugins: [
		typeScriptPlugin({
			check: false,
			tsconfig: path.resolve(__dirname, './tsconfig.json'),
			tsconfigOverride: {
				sourcemap: isDev
			}
		}),
		// replaces()
	],
	watch: {
		include: 'src/**',
		exclude: 'node_modules/**'
	},
	// external: Object.keys(pkg.dependencies),
	output: {
		banner,
		sourcemap: isDev,
		file: './dist/index.js',
		format: 'cjs'
	}
};
