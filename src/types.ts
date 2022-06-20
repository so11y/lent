import chokidar from 'chokidar';
import Http from 'http';
import { WebSocketServer } from 'ws';
import { LentModuleDepends } from './depends';

export interface Router {
	method: string;
	path: string;
	handler: (
		req: Http.IncomingMessage,
		res: Http.ServerResponse
	) => string | Buffer;
}
export interface FileUrl {
	requestUrl: string;
	filePath: string;
	isLentModule: boolean;
	isModulesFile: boolean;
}
export interface TransformPlugin {
	exit?: string;
	exits?: Array<string>;
	name?: string;
	enforce?: 'post' | 'pre';
	transform?: (
		fileData: string,
		fileUrl: FileUrl,
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
		addDepend(fileName: string, lentModule: Partial<LentModuleDepends>): void;
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
		extensions?: Array<string>;
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		middle?: Array<(m: MiddlewareHttp) => Promise<any> | void>;
	};
}

export interface MiddlewareHttp {
	lentInstance: LentHttpInstance;
	http: {
		req: Http.IncomingMessage;
		res: Http.ServerResponse;
	};
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	mate: Record<string, any>;
}
