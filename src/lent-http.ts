import Http from 'http';
import { Socket } from 'net';
import { transform } from './handleFile';
import { LentHttpInstance, Router as TypeRouter } from './types';

export const router = (): LentHttpInstance['router'] => {
	const routers = new Set<TypeRouter>();
	return {
		addRouter(router: TypeRouter) {
			routers.add(router);
		},
		getRouters() {
			return [...routers];
		}
	};
};
export const createHttp = (
	lentInstance: LentHttpInstance
): LentHttpInstance['http'] => {
	const http = Http.createServer();
	return {
		http: () => http,
		start() {
			http.on('upgrade', (req, socket, head) => {
				lentInstance.socket.webSocket.handleUpgrade(
					req,
					socket as Socket,
					head,
					(ws) => {
						lentInstance.socket.webSocket.emit('connection', ws, req);
					}
				);
			});
			http
				.on('request', (req, res) => {
					const etag = lentInstance.depend.getDepend(req.url)?.etag;

					if (etag && req.headers['if-none-match'] === etag) {
						res.statusCode = 304;
						return res.end();
					}

					const item = lentInstance.router
						.getRouters()
						.find((v) => v.path === req.url);
					const plugins = lentInstance.plugin;
					if (item) {
						const indexHtmlPlugin = plugins
							.getPlugins()
							.find((v) => v.name === 'indexHtmlAddClientPlugin');
						if (indexHtmlPlugin) {
							return res.end(
								indexHtmlPlugin.transform(item!.handler().toString(), {
									filePath: 'index.html',
									requestUrl: req.url
								})
							);
						}
						return res.end(item?.handler());
					}

					transform(req, plugins.getPlugins, lentInstance).then(
						(transformValue) => {
							const fileValue = transformValue || '';
							const etag = lentInstance.depend.getDepend(req.url)?.etag;
							res.setHeader('content-Type', 'text/javascript');
							if (etag) {
								res.setHeader('Etag', etag);
							}
							res.end(fileValue);
						}
					);
				})
				.listen(lentInstance.config.port, () => {
					console.log('lent v1.0.0 dev server running at:');
					console.log(`> Local: http://localhost:${lentInstance.config.port}/`);
					console.log(
						`> running time ${
							Date.now() - lentInstance.performance.startTime
						}ms`
					);
				});
		}
	};
};
