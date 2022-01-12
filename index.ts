
import Http from "http";
import fs from "fs";
import path from "path";
import ts from "typescript";
import cheerio from "cheerio";
import { parse, init } from "es-module-lexer";
import { WebSocketServer, WebSocket } from 'ws'
import { Socket } from 'net'
import chokidar from "chokidar";

interface Router {
    method: string;
    path: string;
    handler: () => string | Buffer;
}
interface TransformPlugin {
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
        filePath: string
    }, viteHttpInstance?: viteHttpInstance) => string | Promise<string>;
}

interface viteHttpInstance {
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
        getGraph: () => Map<string, Set<string>>;
        getDepend: (fileName: string) => Set<string>;
        addDepend(fileName: string, childFileName: string): void;
    },
    socket: {
        webSocket: WebSocketServer;
        sendSocket: (v: object) => void;
    },
    watch: chokidar.FSWatcher
}
interface HandleFileSystem {
    (v: viteHttpInstance): {
        change: (filePath: string, stats: fs.Stats) => void
    }
}

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

const plugins = (): viteHttpInstance["plugin"] => {
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
        ignored: ["**/node_modules/**", "**/.git/**"],
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
        socket.on("message", (msg) => {
            console.log(msg, "msg");
        })
    })
    return {
        webSocket,
        sendSocket
    };
}

const isHaveFile = (requireName: string) => {
    const filePath = path.join(process.cwd(), requireName);
    if (fs.existsSync(filePath)) {
        return filePath;
    }
    return false;
}

const findFile = (requireName: string, fileExit: Array<string>) => {
    const f = isHaveFile(requireName);
    if (f) return f;
    for (const exitName of fileExit) {
        const f = isHaveFile(requireName + exitName);
        if (f) {
            return f;
        }
    }
    return "";
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
                console.log("--upgrade--");
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
            }).listen("3050")

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
    return http_;
}

const h = runHttp()

h.router.addRouter({
    method: "GET",
    path: "/",
    handler() {
        return fs.readFileSync("./index.html");
    }
})

h.plugin.addPlugins({
    exit: ".js",
    transform: v => (v)
})

h.plugin.addPlugins({
    exit: ".ts",
    transform: (v) => {
        return ts.transpileModule(v.toString(), {
            compilerOptions: {
                target: ts.ScriptTarget.ESNext,
                module: ts.ModuleKind.ESNext,
                // inlineSourceMap: true
            }
        }).outputText;
    }
})

h.plugin.addPlugins({
    name: "indexHtml",
    transform(v) {
        const $ = cheerio.load(v);
        $("head").append("<script type='module' src='./client' />")
        return $.html();
    }
})

h.plugin.addPlugins({
    exit: ".css",
    transform: (v, fileName) => {
        return `
        const styles =  [...document.querySelectorAll("style")];
        const style = styles.find(v=>v.title === '${fileName}');

        if(style){
            style.innerHTML = '${v.toString().replace(/\n|\r/g, "")}';
        }else{
            const style = document.createElement('style');
            style.setAttribute('type', 'text/css');
            style.title = '${fileName}';
            style.innerHTML = '${v.toString().replace(/\n|\r/g, "")}';
            document.head.appendChild(style);
        }
        `
    }
})

h.plugin.addPlugins({
    exits: [".js", ".ts", ".tsx"],
    async transform(v, file, i) {
        await init;
        const [imports] = parse(v);
        imports.forEach(v => i.depend.addDepend(file.filePath, v.n))
        return v;
    }
})

h.plugin.addPlugins({
    name: "addWatchFile",
    enforce: "post",
    handle: (v, file, i) => i.watch.add(file.filePath)
})

h.http.start();