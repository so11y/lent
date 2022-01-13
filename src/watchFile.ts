import chokidar from "chokidar";
import { HandleFileSystem, viteHttpInstance } from "./types";

export const createWatchFile = (handleFile: ReturnType<HandleFileSystem>) => {
    const watcher = chokidar.watch([], {
        persistent: true
    }).on("change", handleFile.change)
    return watcher
}

export const handleWatchFile: HandleFileSystem = (i: viteHttpInstance) => {
    return {
        change(file, state) {
            i.socket.sendSocket({ fileName: file, hot: true });
        }
    }
}