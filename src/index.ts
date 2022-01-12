
import Http from "http";
import fs from "fs";
import { WebSocketServer, WebSocket } from 'ws'
import { Socket } from 'net'
import chokidar from "chokidar";
import { findFile } from "./share";
import allPlugins, { plugins } from "./plugins"
import { HandleFileSystem, TransformPlugin, viteHttpInstance, Router } from "./types";

const Router = (): viteHttpInstance["router"] => {
    const routers = new Set<Router>();
    return {
        addRouter(router: Router) {
            routers.add(router)
        },
        getRouters() {
            return [...routers];
        }
    }
}

const depends = (): viteHttpInstance["depend"] => {
    const dependGraph = new Map<string, Set<string>>();
    return {
        getGraph: () => dependGraph,
        getDepend: (fileName: string) => (dependGraph.get(fileName)),
        addDepend(fileName: string, childFileName: string) {
            if (dependGraph.has(fileName)) {
                dependGraph.get(fileName).add(childFileName)
            } else {
                dependGraph.set(fileName, new Set([childFileName]))
            }
        }
    }
}

const createWatchFile = (handleFile: ReturnType<HandleFileSystem>) => {
    const watcher = chokidar.watch([], {
        persistent: true
    }).on("change", handleFile.change)
    return watcher
}

const handleWatchFile: HandleFileSystem = (i: viteHttpInstance) => {
    return {
        change(file, state) {
            i.socket.sendSocket({ fileName: file, hot: true });
        }
    }
}

const createWss = () => {
    const webSocket = new WebSocketServer({
        noServer: true
    });
    let socket_: WebSocket = null;
    const sendSocket = (v: object) => {
        socket_.send(JSON.stringify(v))
    };
    webSocket.on('connection', (socket) => {
        socket_ = socket;
        socket.send(JSON.stringify({ type: 'connected' }))
        // socket.on("message", (msg) => {})
    })
    return {
        webSocket,
        sendSocket
    };
}

const transform = (req: Http.IncomingMessage, plugins: () => Array<TransformPlugin>, viteHttpInstance: viteHttpInstance) => {
    const filePath = findFile(req.url, ['.js', '.ts', '.tsx', '.css'])
    const filterplugins = plugins().filter(v => {
        if (req.url.endsWith(v.exit) || filePath.endsWith(v.exit)) {
            return true;
        } else if (v.exits?.some(vv => req.url.includes(vv) || filePath.endsWith(vv))) {
            return true;
        }
    });
    if (filePath && filterplugins.length) {
        const fileData = fs.readFileSync(filePath).toString();
        const fileUrl = {
            filePath,
            requestUrl: req.url
        };
        plugins().filter(v => v.enforce === "post").forEach(v => v.handle(fileData, fileUrl, viteHttpInstance));
        return filterplugins.reduce((prev, next) => prev.then(value => next.transform(value, fileUrl, viteHttpInstance)), Promise.resolve(fileData));
    }
    return Promise.resolve(null)
}

const createHttp_ = (viteInstance: viteHttpInstance): viteHttpInstance["http"] => {
    const http = Http.createServer();
    return {
        http: () => (http),
        start() {
            http.on("upgrade", (req, socket, head) => {
                viteInstance.socket.webSocket.handleUpgrade(req, socket as Socket, head, (ws) => {
                    viteInstance.socket.webSocket.emit('connection', ws, req)
                })
            })
            http.on("request", (req, res) => {
                const item = viteInstance.router.getRouters().find((v) => v.path === req.url);
                const plugins = viteInstance.plugin;
                if (item) {
                    const indexHtmlPlugin = plugins.getPlugins().find(v => v.name === "indexHtml");
                    if (indexHtmlPlugin) {
                        return res.end(indexHtmlPlugin.transform(item!.handler().toString(), {
                            filePath: "./index.html",
                            requestUrl: "./index.html"
                        }));
                    }
                    return res.end(item?.handler())
                }
                transform(req, plugins.getPlugins, viteInstance).then(transformValue => {
                    res.setHeader("content-Type", "text/javascript")
                    res.end(transformValue || "");
                });
            }).listen("3050", () => {
                console.log("lent v1.0.0 dev server running at:");
                console.log("> Local: http://localhost:3050/");
            })

        }
    }
}

const runHttp = (): viteHttpInstance => {
    const http_ = {
        router: Router(),
        plugin: plugins(),
        depend: depends(),
        socket: null as viteHttpInstance["socket"],
        watch: null,
        http: null as ReturnType<typeof createHttp_>
    }
    http_.watch = createWatchFile(handleWatchFile(http_))
    http_.socket = createWss();
    http_.http = createHttp_(http_);
    allPlugins(http_);
    return http_;

}


runHttp().http.start()
