import { LentPlugin } from './preCompose';
import { transformSync } from '@babel/core';

export const transformSyncCode = (code, otherPresets = []) => {
	return transformSync(code, {
		sourceMaps: 'inline',
		presets: [['babel-preset-typescript'], ...otherPresets]
	}).code;
};

export const handleNodeModulePlugin: LentPlugin = (l) => {
	l.plugin.addPlugins({
		name: 'handleNodeModulePlugin',
		enforce: 'post',
		async transform(v, file) {
			if (file.isLentModule && file.isModulesFile) {
				return v;
			}
			if (!file.isLentModule || file.requestUrl.endsWith('.ts')) {
				return transformSyncCode(v);
			}

			return v;
		}
	});
};
