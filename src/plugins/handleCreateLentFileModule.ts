import { createLentModuleDepend } from "../depends";
import { LentPlugin } from "./preCompose"

export const handleFileImportPlugin = (): LentPlugin => {
    return (l) => {
        l.plugin.addPlugins({
            name: "handleCreateLentFileModule",
            enforce: "post",
            transform(v, file, i) {
                i.depend.addDepend(file.filePath, createLentModuleDepend({
                    requestUrl:file.requestUrl,
                    importFile:[]
                }))
                return v;
            }
        })
    }
}