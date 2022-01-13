import { LentPlugin } from "./preCompose"

export const handleJsPlugin = (): LentPlugin => {
    return (l) => {
        l.plugin.addPlugins({
            name:"handleJsPlugin",
            exit: ".js",
            transform: v => (v)
        })
    }
}