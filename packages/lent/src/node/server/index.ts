import http from 'http';
import { FSWatcher } from 'chokidar';
import { LentConfig, userConfig } from '../../types/config';
import { resolveConfig } from './config';
import { httpServer } from './http';
import { createWatcher } from './watcher';
import { Server, WebSocket } from 'ws';
import { handelChange } from './handle-change';
import { createSocket } from './ws';

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
	async init(inlineConfig?: userConfig) {
		this.config = await resolveConfig(inlineConfig);
		this.watcher = createWatcher(this.config.root);
		this.server = httpServer(this.config, this);
		this.socket = createSocket(this);
		this.watcher.on('change', (path, stats) => handelChange(this, path, stats));

		return this;
	}
	start() {
		this.server.start();
	}
}

export const lent = async () => {
	const l = await new Lent().init();
	return l;
};
