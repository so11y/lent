import ts from "typescript";
import { LentPlugin } from "./preCompose"

export const handleTsPlugin: LentPlugin = (l) => {
    l.plugin.addPlugins({
        exit: ".ts",
        name: "handleTsPlugin",
        transform: (v) => {
            return ts.transpileModule(v.toString(), {
                compilerOptions: {
                    target: ts.ScriptTarget.ESNext,
                    module: ts.ModuleKind.ESNext,
                }
            }).outputText;
        }
    })
}