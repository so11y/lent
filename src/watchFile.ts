import chokidar from "chokidar";
import { LentHttpInstance, FileCallback, FileUrl } from "./types";

export const createWatchFile = (l: LentHttpInstance) => {
    const watcher = chokidar.watch([], {
        persistent: true
    }).on("change", (path) => l.watchFileEvent.emit("change", path))
    return watcher
}

export const handleWatchFileEvent = () => {
    const fileWatchEvent = new Map<string, Array<FileCallback>>()
    return {
        on(eventName: string, fileCallback: FileCallback) {
            if (!fileWatchEvent.has(eventName)) {
                fileWatchEvent.set(eventName, [fileCallback])
            } else {
                const fileRegister = fileWatchEvent.get(eventName);
                if (!fileRegister.some(v => v.filePath === fileCallback.filePath)) {
                    fileWatchEvent.get(eventName).push(fileCallback)
                }
            }
        },
        emit(eventName: string, path: string) {
            const event = fileWatchEvent.get(eventName);
            if (event) {
                event.forEach(v => {
                    if (v.filePath === path) v.callback()
                });
            }
        }
    }
}

export const addFileChange = (l: LentHttpInstance, fileUrl: FileUrl, callback: () => void) => {
    l.watchFileEvent.on("change", {
        filePath: fileUrl.filePath,
        callback: () => {
            console.log(`[lent] update file ${fileUrl.requestUrl}`);
            callback()
        }
    })
    l.watch.add(fileUrl.filePath)
}