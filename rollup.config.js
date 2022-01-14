import path from 'path';
import typeScriptPlugin from 'rollup-plugin-typescript2';
import rollupPluginReplace from '@rollup/plugin-replace';
// import { terser } from 'rollup-plugin-terser';
const pkg = require(path.resolve(__dirname, `package.json`));

const banner = `/*!
* ${pkg.name} v${pkg.version}
* (c) ${new Date().getFullYear()} ${pkg.author.name}
* @license MIT
*/`;

const replaces = () => {
    const replacesKey = {
        __TEST__: false
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


export default [
    {
        input: './src/index.ts',
        plugins: [
            typeScriptPlugin({
                check: false,
                tsconfig: path.resolve(__dirname, './tsconfig.json'),
            }),
            replaces(),
        ],
        watch: {
            include: 'src/**',
            exclude: 'node_modules/**'
        },
        external: ['http', 'path', 'ws', 'chokidar', 'fs', 'cheerio', 'typescript', 'es-module-lexer'],
        output: {
            banner,
            file: './dist/index.js',
            format: 'cjs'
        }
    },
    {
        input: './src/client.ts',
        plugins: [
            typeScriptPlugin({
                check: false,
                tsconfig: path.resolve(__dirname, './tsconfig.json'),
            }),
            replaces(),
        ],
        watch: {
            include: 'src/client.ts',
            exclude: 'node_modules/**'
        },
        output: {
            banner,
            file: './dist/client.js',
            format: 'es'
        }
    }
]
