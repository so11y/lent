import path from 'path';
import fs from 'fs';
import { LentHttpInstance } from './types';
import { transformSyncCode } from './plugins/handleNodeModulePlugin';

export const getConfig = (lentHttpInstance: LentHttpInstance) => {
	const cwd = process.cwd();
	const configPaths = [
		path.join(cwd, '/lent.config.js'),
		path.join(cwd, '/lent.config.ts')
	];
	const defineConfig = configPaths.find((configPath) =>
		fs.existsSync(configPath)
	);
	let config: LentHttpInstance['config'] = {};
	if (defineConfig) {
		const extension = path.extname(defineConfig);
		const defaultLoader = require.extensions[extension];
		require.extensions[extension] = (module, requiredFileName) => {
			if (requiredFileName === defineConfig) {
				// eslint-disable-next-line @typescript-eslint/no-explicit-any
				(module as any)._compile(
					transformSyncCode(fs.readFileSync(defineConfig), {
						presets: [
							[
								'@babel/preset-env',
								{
									targets: {
										node: 'current'
									}
								}
							]
						]
					}),
					requiredFileName
				);
			} else {
				if (defaultLoader) {
					defaultLoader(module, requiredFileName);
				}
			}
		};
		const requireConfig = require(defineConfig);
		config = requireConfig.default || requireConfig;
	}

	if (config.plugin) {
		config.plugin(lentHttpInstance);
	}
	return {
		root: cwd,
		port: 3000,
		extensions: ['.js', '.ts', '.css'],
		...config
	};
};
