import { LentConfig, userConfig } from '../../types/config';
import { findFile } from '../utils';
import { build } from 'esbuild';
import { extname } from 'path';

const LENTCONFIGFILENAME = 'lent.config';

const runConfigFile = (filePath: string, code: string) => {
	const extension = extname(filePath);
	const defaultLoader = require.extensions[extension];
	require.extensions[extension] = (module, requiredFileName) => {
		if (requiredFileName === filePath) {
			(module as any)._compile(code, requiredFileName);
		} else {
			if (defaultLoader) {
				defaultLoader(module, requiredFileName);
			}
		}
	};
	return require(filePath);
};

async function bundleConfigFile(
	fileName: string,
	root: string
): Promise<string> {
	const result = await build({
		absWorkingDir: root,
		entryPoints: [fileName],
		write: false,
		platform: 'node',
		bundle: true,
		format: 'cjs',
		sourcemap: 'inline',
		metafile: true
	});
	const { text } = result.outputFiles[0];
	return text;
}

const mergeConfig = (config?: userConfig): LentConfig => {
	const lentConfig: LentConfig = {
		port: config?.port || 3000,
		root: config?.root || '/'
	};
	return lentConfig;
};

export const resolveConfig = async (
	inlineConfig?: userConfig
): Promise<LentConfig> => {
	let config: userConfig | undefined = inlineConfig;
	const configDir = config?.configDir || process.cwd();
	const lentConfigFiles = [
		`${LENTCONFIGFILENAME}.ts`,
		`${LENTCONFIGFILENAME}.js`,
		`${LENTCONFIGFILENAME}.mjs`
	];
	const configPath = findFile(lentConfigFiles, configDir);
	if (configPath) {
		const code = await bundleConfigFile(configPath, configDir);
		config = runConfigFile(configPath, code).default;
	}
	return mergeConfig(config);
};
