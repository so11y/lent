
import { router, createHttp } from "./lent-http";
import { viteHttpInstance } from "./types";
import { createWatchFile, handleWatchFile } from "./watchFile";
import { depends } from "./depends";
import { createWss } from "./wss";
import allPlugins, { plugins } from "./plugins"

const lent = (): viteHttpInstance => {
    const http_ = {
        router: router(),
        plugin: plugins(),
        depend: depends(),
        socket: null as viteHttpInstance["socket"],
        watch: null,
        http: null as viteHttpInstance["http"]
    }
    http_.watch = createWatchFile(handleWatchFile(http_))
    http_.socket = createWss();
    http_.http = createHttp(http_);
    allPlugins(http_);
    return http_;
}


lent().http.start()
