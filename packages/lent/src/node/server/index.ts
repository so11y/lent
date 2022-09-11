import http from 'http';
import { FSWatcher } from 'chokidar';
import { LentConfig, userConfig } from '../../types/config';
import { resolveConfig } from './config';
import { httpServer } from './http';
import { createWatcher } from './watcher';
import { Server, WebSocket } from 'ws';
import { handelChange } from './handle-change';
import { createSocket } from './ws';
import { createPluginContainer, PluginContainer } from './pluginContainer';
import { ModuleGraph } from './moduleGraph';
import { applyMiddleware, Middleware } from './middlewares';

export class Lent {
	config!: LentConfig;
	watcher!: FSWatcher;
	server!: {
		server: http.Server;
		start: () => void;
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
	async init(inlineConfig?: userConfig) {
		this.config = await resolveConfig(inlineConfig);
		this.middleware = applyMiddleware(this);
		this.watcher = createWatcher(this.config.root);
		this.server = httpServer(this);
		this.socket = createSocket(this);
		this.pluginContainer = await createPluginContainer(
			this.config,
			this.watcher
		);
		this.moduleGraph = new ModuleGraph(this.pluginContainer);
		this.watcher.on('change', (path, stats) => handelChange(this, path, stats));
		return this;
	}
	start() {
		this.config.plugins
			.filter((plugin) => plugin.serveStart)
			.forEach((plugin) => plugin.serveStart!(this));
		this.server.start();
	}
}

export const lent = async () => {
	const l = await new Lent().init();
	return l;
};
