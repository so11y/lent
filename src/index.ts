
import { router, createHttp } from "./lent-http";
import { viteHttpInstance } from "./types";
import { createWatchFile, handleWatchFile } from "./watchFile";
import { depends } from "./depends";
import { createWss } from "./wss";
import allPlugins, { plugins } from "./plugins"

const lent = (): viteHttpInstance => {
    const lentInstance_ = {
        router: router(),
        plugin: plugins(),
        depend: depends(),
        socket: null as viteHttpInstance["socket"],
        watch: null,
        http: null as viteHttpInstance["http"]
    }
    lentInstance_.watch = createWatchFile(handleWatchFile(lentInstance_))
    lentInstance_.socket = createWss();
    lentInstance_.http = createHttp(lentInstance_);
    allPlugins(lentInstance_);
    return lentInstance_;
}


lent().http.start()
