import { LentConfig, userConfig } from '../../types/config';
import { findFile } from '../utils';
import { build } from 'esbuild';
import { existsSync } from 'node:fs';
import { extname, isAbsolute, dirname, basename, join } from 'node:path';
import { resolvePlugins } from './plugin/index';

const lentConfigFileName = 'lent.config';
const lentConfigFiles = [
	`${lentConfigFileName}.ts`,
	`${lentConfigFileName}.js`,
	`${lentConfigFileName}.mjs`
];

const runConfigFile = (resolvedPath: string, code: string) => {
	const extension = extname(resolvedPath);
	const defaultLoader = require.extensions[extension];
	require.extensions[extension] = (module, requiredFileName) => {
		if (requiredFileName === resolvedPath) {
			(module as any)._compile(code, requiredFileName);
		} else {
			if (defaultLoader) {
				defaultLoader(module, requiredFileName);
			}
		}
	};
	delete require.cache[require.resolve(resolvedPath)];
	return require(resolvedPath);
};

async function bundleConfigFile(
	fileName: string,
	absWorkingDir: string
): Promise<string> {
	const result = await build({
		absWorkingDir,
		entryPoints: [fileName],
		write: false,
		platform: 'node',
		bundle: true,
		format: 'cjs',
		sourcemap: 'inline',
		metafile: true,
		plugins: [
			{
				name: 'externalize-deps',
				setup(build) {
					build.onResolve({ filter: /.*/ }, (args) => {
						const id = args.path;
						if (id[0] !== '.' && !isAbsolute(id)) {
							return {
								external: true
							};
						}
					});
				}
			}
		]
	});
	const { text } = result.outputFiles[0];
	return text;
}

const mergeConfig = (config?: userConfig): LentConfig => {
	const lentConfig: LentConfig = {
		port: config?.port || 3000,
		root: join(process.cwd(), config?.root || '/'),
		define: Object.assign(
			{
				'process.env.NODE_ENV': 'development'
			},
			config?.define || {}
		),
		resolve: {
			alias: config?.resolve?.alias || []
		},
		plugins: config?.plugins || [],
		extensions: [
			'.mjs',
			'.js',
			'.ts',
			'.jsx',
			'.tsx',
			'.json',
			...(config?.extensions || [])
		],
		middleware: config?.middleware || [],
		build: {}
	};
	lentConfig.plugins = resolvePlugins(lentConfig || {});
	return lentConfig;
};

export async function resolveConfig(
	inlineConfig?: Pick<userConfig, 'configPath'>
): Promise<LentConfig>;
export async function resolveConfig(
	inlineConfig?: Omit<userConfig, 'configPath'>
): Promise<LentConfig>;
export async function resolveConfig(
	inlineConfig?: userConfig
): Promise<LentConfig> {
	let config: userConfig | undefined = inlineConfig;
	const configPath =
		config?.configPath || findFile(lentConfigFiles, process.cwd());

	if (configPath && existsSync(configPath)) {
		const dir = dirname(configPath);
		const fileName = basename(configPath);
		const code = await bundleConfigFile(fileName, dir);
		config = runConfigFile(configPath, code).default;
	}
	return mergeConfig(config);
}
