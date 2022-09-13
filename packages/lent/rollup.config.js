import path from 'path';
import typeScriptPlugin from 'rollup-plugin-typescript2';
const pkg = require(path.resolve(__dirname, `./package.json`));

const isDev = process.env.LENT_DEV === 'dev';

const banner = `/*!
* ${pkg.name} v${pkg.version}
* (c) ${new Date().getFullYear()} ${pkg.author.name}
* @license MIT
*/`;

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
			})
		],
		watch: {
			include: 'src/**',
			exclude: 'node_modules/**'
		},
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
		input: './src/node/server/index.ts',
		file: './dist/index.js',
		format: 'cjs'
	}),
	defineBuild({
		input: './src/client/client.ts',
		file: './dist/client.js',
		format: 'esm'
	})
];
