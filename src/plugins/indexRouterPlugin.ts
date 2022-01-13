
import fs from "fs";
import path from "path";
import { createLentModuleDepend } from "../depends";
import { LentPlugin } from "./preCompose"

export const indexRouterPlugin: LentPlugin = (l) => {
    l.router.addRouter({
        method: "GET",
        path: "/",
        handler() {
            const indexPath = path.join(l.config.root, "./index.html");
            l.watch.add(indexPath)
            l.watchFileEvent.on("change", {
                filePath: indexPath,
                callback: () => {
                    console.log(`[lent] update file ${indexPath}`);
                    l.socket.sendSocket({ fileName: indexPath, hot: true });
                }
            })
            l.depend.addDepend(indexPath, createLentModuleDepend({
                importFile: []
            }));
            return fs.readFileSync(indexPath);
        }
    })
}