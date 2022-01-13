import { parse, init } from "es-module-lexer";
import { LentPlugin } from "./preCompose"

export const handleFileImportPlugin = (): LentPlugin => {
    return (l) => {
        l.plugin.addPlugins({
            name:"handleFileImportPlugin",
            exits: [".js", ".ts", ".tsx"],
            async transform(v, file, i) {
                await init;
                const [imports] = parse(v);
                i.depend.getDepend(file.requestUrl).importFile =  [...imports];
                return v;
            }
        })
    }
}