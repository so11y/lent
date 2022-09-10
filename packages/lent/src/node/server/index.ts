import { FSWatcher } from 'chokidar';
import { LentConfig, userConfig } from '../../types/config';
import { resolveConfig } from './config';
import { httpServer } from './http';
import { createWatcher } from './watcher';
import http from 'http';

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
	async init(inlineConfig?: userConfig) {
		this.config = await resolveConfig(inlineConfig);
		this.watcher = createWatcher(this.config.root);
		this.server = httpServer(this.config, this);
		return this
	}
	start() {
		this.server.start();
	}
}

export const lent = async () => {
	const l = await new Lent().init();
	return l;
};
