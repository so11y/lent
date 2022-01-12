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
const transform = (req, plugins) => {
    const filePath = findFile(req.url, ['.js', '.ts', '.tsx', '.css']);
    const plugin = plugins().find(v => req.url.endsWith(v.exit) || filePath.endsWith(v.exit));
    if (filePath && plugin) {
        return plugin.transform(fs_1.default.readFileSync(filePath).toString(), req.url);
    }
    return null;
};
const createHttp_ = (viteInstance) => {
    const http = http_1.default.createServer();
    return {
        http() { (http); },
        start() {
            http.on("request", (req, res) => {
                const item = viteInstance.router.getRouters().find((v) => v.path === req.url);
                const plugins = viteInstance.plugin;
                if (item) {
                    const indexHtmlPlugin = plugins.getPlugins().find(v => v.name === "indexHtml");
                    if (indexHtmlPlugin) {
                        return res.end(indexHtmlPlugin.transform(item.handler().toString(), "index.html"));
                    }
                    return res.end(item?.handler());
                }
                const transformValue = transform(req, plugins.getPlugins);
                res.setHeader("content-Type", "text/javascript");
                res.end(transformValue || "");
            });
            http.listen("3050");
        }
    };
};
const runHttp = () => {
    const router = Router();
    const plugin = plugins();
    const http_ = {
        router,
        plugin,
        http: null
    };
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
h.http.start();
