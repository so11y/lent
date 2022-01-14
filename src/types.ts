import type chokidar from 'chokidar';
import type { WebSocketServer } from 'ws';
import { LentModuleDepends } from './depends';

export interface Router {
	method: string;
	path: string;
	handler: () => string | Buffer;
}
export interface FileUrl {
	requestUrl: string;
	filePath: string;
}
export interface TransformPlugin {
	exit?: string;
	exits?: Array<string>;
	name?: string;
	enforce?: 'post' | 'pre';
	handle?: (
		fileData: string,
		fileUrl: FileUrl,
		lentHttpInstance?: LentHttpInstance
	) => void;
	transform?: (
		fileData: string,
		fileUrl: {
			requestUrl: string;
			filePath: string;
		},
		lentHttpInstance?: LentHttpInstance
	) => string | Promise<string>;
}

export interface FileCallback {
	filePath: string;
	callback: () => void;
}
export interface HandleWatchFileEvent {
	on(eventName: string, fileCallback: FileCallback): void;
	emit(eventName: string, path: string): void;
}

export interface LentHttpInstance {
	performance: {
		startTime: number;
	};
	router: {
		addRouter(router: Router): void;
		getRouters(): Router[];
	};
	plugin: {
		addPlugins(p: TransformPlugin): void;
		getPlugins(): TransformPlugin[];
	};
	http: {
		http(): void;
		start(): void;
	};
	depend: {
		getGraph: () => Map<string, LentModuleDepends>;
		getDepend: (fileName: string) => LentModuleDepends;
		addDepend(fileName: string, lentModule: LentModuleDepends): void;
	};
	socket: {
		webSocket: WebSocketServer;
		sendSocket: (v: object) => void;
	};
	watch: chokidar.FSWatcher;
	watchFileEvent: HandleWatchFileEvent;
	config: {
		root?: string;
		port?: number;
		plugin?: (v: LentHttpInstance) => void;
	};
}
