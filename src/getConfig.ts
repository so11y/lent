import path from "path";
import fs from "fs";
import { LentHttpInstance } from "./types";

export const getConfig = (lentHttpInstance: LentHttpInstance) => {
    const cwd = process.cwd();
    const configPath = path.join(cwd, "/lent.config.js");
    let config: LentHttpInstance["config"] = {};
    if (fs.existsSync(configPath)) {
        config = require(configPath);
    }
    if (config.plugin) {
        config.plugin(lentHttpInstance)
    }
    return {
        root: cwd,
        port: 3000,
        ...config
    };
}
