import type chokidar from "chokidar";
import type { WebSocketServer } from 'ws'
import type fs from "fs";
import { LentModuleDepends } from "./depends";

export interface Router {
    method: string;
    path: string;
    handler: () => string | Buffer;
}
export interface TransformPlugin {
    exit?: string;
    exits?: Array<string>;
    name?: string;
    enforce?: "post" | "pre";
    handle?: (fileData: string, fileUrl: {
        requestUrl: string,
        filePath: string
    }, viteHttpInstance?: viteHttpInstance) => void;
    transform?: (fileData: string, fileUrl: {
        requestUrl: string,
        filePath: string,
    }, viteHttpInstance?: viteHttpInstance) => string | Promise<string>;
}

export interface viteHttpInstance {
    performance: {
        startTime: number
    },
    router: {
        addRouter(router: Router): void;
        getRouters(): Router[];
    },
    plugin: {
        addPlugins(p: TransformPlugin): void;
        getPlugins(): TransformPlugin[];
    },
    http: {
        http(): void;
        start(): void;
    },
    depend: {
        getGraph: () => Map<string, LentModuleDepends>;
        getDepend: (fileName: string) => LentModuleDepends;
        addDepend(fileName: string, lentModule: LentModuleDepends): void;
    },
    socket: {
        webSocket: WebSocketServer;
        sendSocket: (v: object) => void;
    },
    watch: chokidar.FSWatcher,
    config: {
        root?: string,
        port?: number,
        plugin?: (v: viteHttpInstance) => void
    }
}
export interface HandleFileSystem {
    (v: viteHttpInstance): {
        change: (filePath: string, stats: fs.Stats) => void
    }
}
