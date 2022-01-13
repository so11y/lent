import { TransformPlugin, viteHttpInstance } from "../types";
import { indexRouterPlugin } from "./indexRouterPlugin";
import { handleCssPlugin } from "./handleCssPlugin";
import { indexHtmlAddClientPlugin } from "./indexHtmlAddClientPlugin";
import { handleJsPlugin } from "./handleJsPlugin";
import { handleTsPlugin } from "./handleTsPlugin";
import { handleFileImportPlugin } from "./handleFileImportPlugin";
import { handleFileWatchPlugin } from "./handleFileWatchPlugin";
import { handleSocketPortPlugin } from "./handleSocketPortPlugin";
import { handleCreateLentFileModule } from "./handleCreateLentFileModule"

export type LentPlugin = (l: viteHttpInstance) => void;


export const plugins = (): viteHttpInstance["plugin"] => {
    const plugins: Array<TransformPlugin> = []
    return {
        addPlugins(p: TransformPlugin) {
            plugins.push(p);
        },
        getPlugins() {
            return plugins;
        }
    }
}

export const preCompose = (): Array<LentPlugin> => {
    return [
        indexRouterPlugin,
        indexHtmlAddClientPlugin,
        handleJsPlugin,
        handleCssPlugin,
        handleTsPlugin,
        handleFileImportPlugin,
        handleSocketPortPlugin,
        handleCreateLentFileModule,
        handleFileWatchPlugin
    ]
}

export const applyComposePlugin = (l: viteHttpInstance) => {
    preCompose().forEach(p => p(l))
}