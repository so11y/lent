import { addFileChange } from "../watchFile";
import { LentPlugin } from "./preCompose"

export const handleFileWatchPlugin: LentPlugin = (l) => {
    const setFileEtag = (requestUrl: string, isSend: boolean) => {
        l.depend.getDepend(requestUrl).etag = Date.now().toString()
        if (isSend) {
            l.socket.sendSocket({ fileName: requestUrl, hot: true });
        }
    }
    l.plugin.addPlugins({
        name: "handleFileWatchPlugin",
        enforce: "post",
        handle: (v, file, i) => {
            setFileEtag(file.requestUrl, false);
            addFileChange(i, file, () => {
                setFileEtag(file.requestUrl, true)
            })
        }
    })
}