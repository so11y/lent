import aliasPlugin from '@rollup/plugin-alias';
import { htmlPlugin } from './html';
import { esbuildPlugin } from './esbuild';
import { resolvePlugin } from './resolve';
import { loadFilePlugin } from './loadFile';
import { clientPlugin } from './handleClient';
import { importAnalysisPlugin } from './importAnalysis';
import { definePlugin } from './define';
import { LentConfig } from 'src/types/config';
import { Plugin } from '../../../types/plugin';

export const resolvePlugins = (config: LentConfig): Plugin[] => {
	return [
		...config.plugins,
		aliasPlugin({ entries: config.resolve.alias }) as Plugin,
		definePlugin(),
		clientPlugin(),
		htmlPlugin(),
		esbuildPlugin(),
		resolvePlugin(),
		loadFilePlugin(),
		importAnalysisPlugin()
	];
};
