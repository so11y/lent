
import Http from "http";
import fs from "fs";
import path from "path";
import ts from "typescript";
import cheerio from "cheerio";


interface Router {
    method: string;
    path: string;
    handler: () => string | Buffer;
}
interface TransformPlugin {
    exit?: string;
    name?: string;
    transform: (file: string, fileName: string) => string;
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


const transform = (req: Http.IncomingMessage, plugins: () => Array<TransformPlugin>) => {
    const filePath = findFile(req.url, ['.js', '.ts', '.tsx', '.css'])
    const plugin = plugins().find(v => req.url.endsWith(v.exit) || filePath.endsWith(v.exit));
    if (filePath && plugin) {
        return plugin.transform(fs.readFileSync(filePath).toString(), req.url);
    }
    return null
}

const createHttp_ = (viteInstance: viteHttpInstance): viteHttpInstance["http"] => {
    const http = Http.createServer();
    return {
        http() { (http) },
        start() {
            http.on("request", (req, res) => {
                const item = viteInstance.router.getRouters().find((v) => v.path === req.url);
                const plugins = viteInstance.plugin;

                if (item) {
                    const indexHtmlPlugin = plugins.getPlugins().find(v => v.name === "indexHtml");
                    if (indexHtmlPlugin) {
                        return res.end(indexHtmlPlugin.transform(item!.handler().toString(), "index.html"));
                    }
                    return res.end(item?.handler())
                }

                const transformValue = transform(req, plugins.getPlugins);

                res.setHeader("content-Type", "text/javascript")

                res.end(transformValue || "");
            })
            http.listen("3050")
        }
    }
}

const runHttp = (): viteHttpInstance => {
    const router = Router();
    const plugin = plugins();
    const http_ = {
        router,
        plugin,
        http: null as ReturnType<typeof createHttp_>
    }
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

h.http.start();