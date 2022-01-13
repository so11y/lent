import Etag from "etag";
import { LentPlugin } from "./preCompose"

export const handleFileWatchPlugin = (): LentPlugin => {
    return (l) => {
        l.plugin.addPlugins({
            name: "handleFileWatchPlugin",
            enforce: "post",
            handle: (v, file, i) => {
                i.depend.getDepend(file.requestUrl).etag = Etag(v, { weak: true })
                i.watch.add(file.filePath)
            }
        })
    }
}