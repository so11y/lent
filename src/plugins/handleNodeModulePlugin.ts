import { LentPlugin } from './preCompose';
import { transformSync } from '@babel/core';
import path from 'path';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const transformSyncCode = (code, options = {} as any) => {
	const outherConfig = options.config || {};
	return transformSync(code, {
		sourceMaps: 'inline',
		...outherConfig,
		presets: [['babel-preset-typescript'], ...(options.presets || [])]
	}).code;
};

export const handleNodeModulePlugin: LentPlugin = (l) => {
	l.plugin.addPlugins({
		name: 'handleNodeModulePlugin',
		enforce: 'post',
		async transform(v, file, i) {
			if (file.isLentModule && file.isModulesFile) {
				return v;
			}
			if (!file.isLentModule || file.requestUrl.endsWith('.ts')) {
				return transformSyncCode(v, {
					config: {
						sourceFileName: path.join(
							process.cwd(),
							i.config.root,
							file.requestUrl
						)
					}
				});
			}

			return v;
		}
	});
};
