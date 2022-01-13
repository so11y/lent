import path from "path";
import fs from "fs";
import { viteHttpInstance } from "./types";

export const getConfig = (viteHttpInstance: viteHttpInstance) => {
    const cwd = process.cwd();
    const configPath = path.join(cwd, "/lent.config.js");
    let config: viteHttpInstance["config"] = {};
    if (fs.existsSync(configPath)) {
        config = require(configPath);
    }
    if (config.plugin) {
        config.plugin(viteHttpInstance)
    }
    return {
        root: cwd,
        port: 3000,
        ...config
    };
}
