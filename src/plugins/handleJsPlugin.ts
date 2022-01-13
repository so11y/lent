import { LentPlugin } from "./preCompose"

export const handleJsPlugin: LentPlugin = (l) => {
    l.plugin.addPlugins({
        name: "handleJsPlugin",
        exit: ".js",
        transform: v => (v)
    })
}