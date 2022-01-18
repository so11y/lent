import { TransformPlugin, LentHttpInstance } from '../types';
import { indexRouterPlugin } from './indexRouterPlugin';
import { handleCssPlugin } from './handleCssPlugin';
import { indexHtmlAddClientPlugin } from './indexHtmlAddClientPlugin';
import { handleJsPlugin } from './handleJsPlugin';
import { handleTsPlugin } from './handleTsPlugin';
import { handleFileImportPlugin } from './handleFileImportPlugin';
import { handleFileWatchPlugin } from './handleFileWatchPlugin';
import { handleSocketPortPlugin } from './handleSocketPortPlugin';
import { handleCreateLentFileModulePlugin } from './handleCreateLentFileModulePlugin';
import { handleInjectClientPlugin } from './handleInjectClientPlugin';
import { handleNodeModulePlugin } from './handleNodeModulePlugin';

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
		handleJsPlugin,
		handleCssPlugin,
		handleTsPlugin,
		handleFileImportPlugin,
		handleSocketPortPlugin,
		handleCreateLentFileModulePlugin,
		handleFileWatchPlugin,
		handleInjectClientPlugin,
		handleNodeModulePlugin
	];
};

export const applyComposePlugin = (l: LentHttpInstance) => {
	preCompose().forEach((p) => p(l));
};
