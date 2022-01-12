import ts from "typescript";
import cheerio from "cheerio";
import { parse, init } from "es-module-lexer";
import { TransformPlugin, viteHttpInstance } from "./types";
import fs from "fs";

export const plugins = (): viteHttpInstance["plugin"] => {
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


export default (h: viteHttpInstance) => {
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
                    inlineSourceMap: true
                }
            }).outputText;
        }
    })

    h.plugin.addPlugins({
        name: "indexHtml",
        transform(v) {
            const $ = cheerio.load(v);
            $("head").append("<script type='module' src='./dist/client' />")
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
}