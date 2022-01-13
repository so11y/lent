
import { router, createHttp } from "./lent-http";
import { viteHttpInstance } from "./types";
import { createWatchFile, handleWatchFile } from "./watchFile";
import { depends } from "./depends";
import { createWss } from "./wss";
import { getConfig } from "./getConfig"
import { plugins, applyComposePlugin } from "./plugins/preCompose"

const lent = (): viteHttpInstance => {
    const lentInstance_ = {
        performance: {
            startTime: Date.now()
        },
        router: router(),
        plugin: plugins(),
        depend: depends(),
        config: null,
        socket: null,
        watch: null,
        http: null,
    }
    lentInstance_.watch = createWatchFile(handleWatchFile(lentInstance_))
    lentInstance_.socket = createWss();
    lentInstance_.http = createHttp(lentInstance_);
    lentInstance_.config = getConfig(lentInstance_);
    applyComposePlugin(lentInstance_)
    return lentInstance_;
}


lent().http.start()
