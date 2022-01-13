
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
            l.depend.addDepend(indexPath, createLentModuleDepend({
                importFile: []
            }));
            return fs.readFileSync(indexPath);
        }
    })
}