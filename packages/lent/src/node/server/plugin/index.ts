import aliasPlugin from '@rollup/plugin-alias';
import { htmlPlugin } from './html';
import { esbuildPlugin } from './esbuild';
import { resolvePlugin } from './resolve';
import { loadFilePlugin } from './loadFile';
import { clientPlugin } from './handleClient';
import { importAnalysisPlugin } from './importAnalysis';
import { definePlugin } from './define';
import { LentConfig } from '../../../types/config';
import { Plugin } from '../../../types/plugin';
import { sortUserPlugins } from '../../utils';

export const resolvePlugins = (config: LentConfig): Plugin[] => {
	const [prePlugins, normalPlugins, postPlugins] = sortUserPlugins(
		config.plugins
	);
	return [
		aliasPlugin({ entries: config.resolve.alias }) as Plugin,
		definePlugin(),
		...prePlugins,
		clientPlugin(),
		htmlPlugin(),
		esbuildPlugin(),
		...normalPlugins,
		resolvePlugin(),
		loadFilePlugin(),
		...postPlugins,
		importAnalysisPlugin()
	];
};
