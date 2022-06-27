import path from 'path';
import fs from 'fs';
import { LentHttpInstance } from './types';
import { transformSyncCode } from './plugins/handleNodeModulePlugin';

export const getConfig = (lentHttpInstance: LentHttpInstance) => {
	const cwd = process.cwd();
	const configPath = path.join(cwd, '/lent.config.js');
	let config: LentHttpInstance['config'] = {};
	const defaultLoader = require.extensions['.js'];
	require.extensions['.js'] = (module, requiredFileName) => {
		if (requiredFileName === configPath) {
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			(module as any)._compile(
				transformSyncCode(fs.readFileSync(configPath), [
					[
						'@babel/preset-env',
						{
							targets: {
								node: 'current'
							}
						}
					]
				]),
				requiredFileName
			);
		} else {
			if (defaultLoader) {
				defaultLoader(module, requiredFileName);
			}
		}
	};
	if (fs.existsSync(configPath)) {
		config = require(configPath).default;
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
