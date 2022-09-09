import path from 'path';
import typeScriptPlugin from 'rollup-plugin-typescript2';
import rollupPluginReplace from '@rollup/plugin-replace';
// import { terser } from 'rollup-plugin-terser';
const pkg = require(path.resolve(__dirname, `package.json`));

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

const defineBuild = (options) => {
	return {
		input: options.input,
		plugins: [
			typeScriptPlugin({
				check: false,
				tsconfig: path.resolve(__dirname, './tsconfig.json'),
				tsconfigOverride: {
					sourcemap: isDev
				}
			}),
			replaces()
		],
		watch: {
			include: 'src/**',
			exclude: 'node_modules/**'
		},
		external: Object.keys(pkg.dependencies),
		output: {
			banner,
			sourcemap: isDev,
			file: options.file,
			format: options.format
		}
	};
};

export default [
	defineBuild({
		input: './src/index.ts',
		file: './dist/index.js',
		format: 'cjs'
	}),
	defineBuild({
		input: './src/client.ts',
		file: './dist/client.js',
		format: 'es'
	})
];
