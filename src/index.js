"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const http_1 = __importDefault(require("http"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const typescript_1 = __importDefault(require("typescript"));
const cheerio_1 = __importDefault(require("cheerio"));
const es_module_lexer_1 = require("es-module-lexer");
const ws_1 = require("ws");
const chokidar_1 = __importDefault(require("chokidar"));
const Router = () => {
    const routers = new Set();
    return {
        addRouter(router) {
            routers.add(router);
        },
        getRouters() {
            return [...routers];
        }
    };
};
const plugins = () => {
    const plugins = [];
    return {
        addPlugins(p) {
            plugins.push(p);
        },
        getPlugins() {
            return plugins;
        }
    };
};
const depends = () => {
    const dependGraph = new Map();
    return {
        getGraph: () => dependGraph,
        getDepend: (fileName) => (dependGraph.get(fileName)),
        addDepend(fileName, childFileName) {
            if (dependGraph.has(fileName)) {
                dependGraph.get(fileName).add(childFileName);
            }
            else {
                dependGraph.set(fileName, new Set([childFileName]));
            }
        }
    };
};
const createWatchFile = (handleFile) => {
    const watcher = chokidar_1.default.watch([], {
        ignored: ["**/node_modules/**", "**/.git/**"],
        persistent: true
    }).on("change", handleFile.change);
    return watcher;
};
const handleWatchFile = (i) => {
    return {
        change(file, state) {
            i.socket.sendSocket({ fileName: file, hot: true });
        }
    };
};
const createWss = () => {
    const webSocket = new ws_1.WebSocketServer({
        noServer: true
    });
    let socket_ = null;
    const sendSocket = (v) => {
        socket_.send(JSON.stringify(v));
    };
    webSocket.on('connection', (socket) => {
        socket_ = socket;
        socket.send(JSON.stringify({ type: 'connected' }));
        socket.on("message", (msg) => {
            console.log(msg, "msg");
        });
    });
    return {
        webSocket,
        sendSocket
    };
};
const isHaveFile = (requireName) => {
    const filePath = path_1.default.join(process.cwd(), requireName);
    if (fs_1.default.existsSync(filePath)) {
        return filePath;
    }
    return false;
};
const findFile = (requireName, fileExit) => {
    const f = isHaveFile(requireName);
    if (f)
        return f;
    for (const exitName of fileExit) {
        const f = isHaveFile(requireName + exitName);
        if (f) {
            return f;
        }
    }
    return "";
};
const transform = (req, plugins, viteHttpInstance) => {
    const filePath = findFile(req.url, ['.js', '.ts', '.tsx', '.css']);
    const filterplugins = plugins().filter(v => {
        if (req.url.endsWith(v.exit) || filePath.endsWith(v.exit)) {
            return true;
        }
        else if (v.exits?.some(vv => req.url.includes(vv) || filePath.endsWith(vv))) {
            return true;
        }
    });
    if (filePath && filterplugins.length) {
        const fileData = fs_1.default.readFileSync(filePath).toString();
        const fileUrl = {
            filePath,
            requestUrl: req.url
        };
        plugins().filter(v => v.enforce === "post").forEach(v => v.handle(fileData, fileUrl, viteHttpInstance));
        return filterplugins.reduce((prev, next) => prev.then(value => next.transform(value, fileUrl, viteHttpInstance)), Promise.resolve(fileData));
    }
    return Promise.resolve(null);
};
const createHttp_ = (viteInstance) => {
    const http = http_1.default.createServer();
    return {
        http: () => (http),
        start() {
            http.on("upgrade", (req, socket, head) => {
                console.log("--upgrade--");
                viteInstance.socket.webSocket.handleUpgrade(req, socket, head, (ws) => {
                    viteInstance.socket.webSocket.emit('connection', ws, req);
                });
            });
            http.on("request", (req, res) => {
                const item = viteInstance.router.getRouters().find((v) => v.path === req.url);
                const plugins = viteInstance.plugin;
                if (item) {
                    const indexHtmlPlugin = plugins.getPlugins().find(v => v.name === "indexHtml");
                    if (indexHtmlPlugin) {
                        return res.end(indexHtmlPlugin.transform(item.handler().toString(), {
                            filePath: "./index.html",
                            requestUrl: "./index.html"
                        }));
                    }
                    return res.end(item?.handler());
                }
                transform(req, plugins.getPlugins, viteInstance).then(transformValue => {
                    res.setHeader("content-Type", "text/javascript");
                    res.end(transformValue || "");
                });
            }).listen("3050");
        }
    };
};
const runHttp = () => {
    const http_ = {
        router: Router(),
        plugin: plugins(),
        depend: depends(),
        socket: null,
        watch: null,
        http: null
    };
    http_.watch = createWatchFile(handleWatchFile(http_));
    http_.socket = createWss();
    http_.http = createHttp_(http_);
    return http_;
};
const h = runHttp();
h.router.addRouter({
    method: "GET",
    path: "/",
    handler() {
        return fs_1.default.readFileSync("./index.html");
    }
});
h.plugin.addPlugins({
    exit: ".js",
    transform: v => (v)
});
h.plugin.addPlugins({
    exit: ".ts",
    transform: (v) => {
        return typescript_1.default.transpileModule(v.toString(), {
            compilerOptions: {
                target: typescript_1.default.ScriptTarget.ESNext,
                module: typescript_1.default.ModuleKind.ESNext,
                // inlineSourceMap: true
            }
        }).outputText;
    }
});
h.plugin.addPlugins({
    name: "indexHtml",
    transform(v) {
        const $ = cheerio_1.default.load(v);
        $("head").append("<script type='module' src='./client' />");
        return $.html();
    }
});
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
        `;
    }
});
h.plugin.addPlugins({
    exits: [".js", ".ts", ".tsx"],
    async transform(v, file, i) {
        await es_module_lexer_1.init;
        const [imports] = (0, es_module_lexer_1.parse)(v);
        imports.forEach(v => i.depend.addDepend(file.filePath, v.n));
        return v;
    }
});
h.plugin.addPlugins({
    name: "addWatchFile",
    enforce: "post",
    handle: (v, file, i) => i.watch.add(file.filePath)
});
h.http.start();
