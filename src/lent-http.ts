import Http from "http";
import { Socket } from 'net'
import { transform } from "./handleFile";
import { viteHttpInstance, Router as TypeRouter } from "./types";

export const router = (): viteHttpInstance["router"] => {
    const routers = new Set<TypeRouter>();
    return {
        addRouter(router: TypeRouter) {
            routers.add(router)
        },
        getRouters() {
            return [...routers];
        }
    }
}
export const createHttp = (viteInstance: viteHttpInstance): viteHttpInstance["http"] => {
    const http = Http.createServer();
    return {
        http: () => (http),
        start() {
            http.on("upgrade", (req, socket, head) => {
                viteInstance.socket.webSocket.handleUpgrade(req, socket as Socket, head, (ws) => {
                    viteInstance.socket.webSocket.emit('connection', ws, req)
                })
            })
            http.on("request", (req, res) => {

                if (req.headers["if-none-match"] === viteInstance.depend.getDepend(req.url)?.etag) {
                    res.statusCode = 304
                    return res.end();
                }

                const item = viteInstance.router.getRouters().find((v) => v.path === req.url);

                const plugins = viteInstance.plugin;

                if (item) {
                    const indexHtmlPlugin = plugins.getPlugins().find(v => v.name === "indexHtmlAddClientPlugin");
                    if (indexHtmlPlugin) {
                        return res.end(indexHtmlPlugin.transform(item!.handler().toString(), {
                            filePath: "index.html",
                            requestUrl: req.url,
                        }));
                    }
                    return res.end(item?.handler())
                }

                transform(req, plugins.getPlugins, viteInstance).then(transformValue => {
                    const fileValue = transformValue || "";
                    const etag = viteInstance.depend.getDepend(req.url)?.etag;
                    res.setHeader("content-Type", "text/javascript")
                    if (etag) {
                        res.setHeader('Etag', etag)
                    }
                    res.end(fileValue);
                });

            }).listen(viteInstance.config.port, () => {
                console.log("lent v1.0.0 dev server running at:");
                console.log(`> Local: http://localhost:${viteInstance.config.port}/`);
                console.log(`> running time ${Date.now() - viteInstance.performance.startTime}ms`);
            })

        }
    }
}