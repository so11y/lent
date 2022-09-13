import http from 'http';
import { FSWatcher } from 'chokidar';
import { LentConfig, userConfig } from '../../types/config';
import { resolveConfig } from './config';
import { httpServer } from './http';
import { createWatcher } from './watcher';
import { Server, WebSocket } from 'ws';
import { handelChange } from './handleChange';
import { createSocket } from './ws';
import { createPluginContainer, PluginContainer } from './pluginContainer';
import { ModuleGraph } from './moduleGraph';
import { applyMiddleware, Middleware, MiddlewarePlugin } from './middlewares';
import { Plugin } from '../../types/plugin';
export { MiddlewarePlugin, Middleware, LentConfig, userConfig, Plugin };

export const defineConfig = (config: userConfig): userConfig => {
	return config;
};

export class Lent {
	config!: LentConfig;
	watcher!: FSWatcher;
	server!: {
		server: http.Server;
		start: () => void;
		close: () => Promise<void>;
	};
	performance = {
		startTime: Date.now()
	};
	socket!: {
		webSocket: Server<WebSocket>;
		sendSocket: (v: Record<string, any>) => void;
	};
	moduleGraph!: ModuleGraph;
	pluginContainer!: PluginContainer;
	middleware!: Middleware;
	inlineConfig?: userConfig;
	isRestarted = false;
	async init(inlineConfig?: userConfig) {
		this.inlineConfig = inlineConfig;
		this.config = await resolveConfig(inlineConfig);
		this.middleware = applyMiddleware(this);
		this.watcher = createWatcher();
		this.server = httpServer(this);
		this.socket = createSocket(this);
		this.pluginContainer = await createPluginContainer(
			this.config,
			this.watcher
		);
		this.moduleGraph = new ModuleGraph(this.pluginContainer);
		this.watcher.on('change', (path) => handelChange(this, path));
		return this;
	}
	async start() {
		const configureServerHooks = this.config.plugins.filter(
			(plugin) => plugin.configureServer
		);

		await configureServerHooks.reduce((prev, next) => {
			return prev.then(async () => {
				return (await next.configureServer!(this)) as void;
			});
		}, Promise.resolve());

		this.server.start();
	}
	async restart() {
		await Promise.all([
			this.watcher.close(),
			this.server.close(),
			this.pluginContainer.close()
		]);
		let newLent = await new Lent();
		await newLent.init(this.inlineConfig);
		await newLent.start();
		for (const key in newLent) {
			if (key !== 'isRestarted') {
				// @ts-ignore
				this[key] = newLent[key];
			}
		}
		return this;
	}
}

export const lent = async () => {
	const l = await new Lent().init();
	return l;
};
