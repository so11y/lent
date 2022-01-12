import Http from "http";
import path from "path";
import fs from "fs";

export const isJsFlieRequest = (s: Http.IncomingMessage) => {
    return s.url.endsWith(".js")
}

export const isHaveFile = (requireName: string) => {
    const filePath = path.join(process.cwd(), requireName);
    if (fs.existsSync(filePath)) {
        return filePath;
    }
    return false;
}

export const findFile = (requireName: string, fileExit: Array<string>) => {
    const f = isHaveFile(requireName);
    if (f) return f;
    for (const exitName of fileExit) {
        const f = isHaveFile(requireName + exitName);
        if (f) {
            return f;
        }
    }
    return "";
}