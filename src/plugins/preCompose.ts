import { TransformPlugin, LentHttpInstance } from '../types';
import { indexRouterPlugin } from './indexRouterPlugin';
import { handleCssPlugin } from './handleCssPlugin';
import { indexHtmlAddClientPlugin } from './indexHtmlAddClientPlugin';
import { handleFileImportPlugin } from './handleFileImportPlugin';
import { handleFileWatchPlugin } from './handleFileWatchPlugin';
import { handleSocketPortPlugin } from './handleSocketPortPlugin';
import { handleCreateLentFileModulePlugin } from './handleCreateLentFileModulePlugin';
import { handleInjectClientPlugin } from './handleInjectClientPlugin';
import { handleNodeModulePlugin } from './handleNodeModulePlugin';
import { handleEnvPlugin } from './handleEnvPlugin';

export type LentPlugin = (l: LentHttpInstance) => void;

export const plugins = (): LentHttpInstance['plugin'] => {
	const plugins: Array<TransformPlugin> = [];
	return {
		addPlugins(p: TransformPlugin) {
			plugins.push(p);
		},
		getPlugins() {
			return plugins;
		}
	};
};

export const preCompose = (): Array<LentPlugin> => {
	return [
		indexRouterPlugin,
		indexHtmlAddClientPlugin,
		handleCssPlugin,
		handleFileImportPlugin,
		handleCreateLentFileModulePlugin,
		handleFileWatchPlugin,
		handleNodeModulePlugin,
		handleInjectClientPlugin,
		handleSocketPortPlugin,
		handleEnvPlugin
	];
};

export const applyComposePlugin = (l: LentHttpInstance) => {
	preCompose().forEach((p) => p(l));
};
