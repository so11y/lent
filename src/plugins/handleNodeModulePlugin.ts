import { LentPlugin } from './preCompose';
import { transformSync } from '@babel/core';
import path from 'path';

export const transformSyncCode = (
	code,
	otherPresets = [],
	sourceFileName = ''
) => {
	return transformSync(code, {
		sourceMaps: 'inline',
		sourceFileName,
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
			return transformSyncCode(v, [], path.join(process.cwd(), file.filePath));
		}
	});
};
