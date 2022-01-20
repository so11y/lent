import Http from 'http';
import path from 'path';
import { Socket } from 'net';
import { transform } from './handleFile';
import { handleUrl } from './share';
import { LentHttpInstance, Router as TypeRouter } from './types';
const pkg = require(path.resolve(__dirname, `../package.json`));

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
					const [requestFileName, isHot] = handleUrl(req.url);

					const model = lentInstance.depend.getDepend(requestFileName);
					if (
						model &&
						(req.headers['if-none-match'] === model.etag ||
							model.isNotLentModule === false)
					) {
						res.statusCode = 304;
						return res.end();
					}

					const item = lentInstance.router
						.getRouters()
						.find((v) => v.path === requestFileName);

					const plugins = lentInstance.plugin;
					if (item) {
						const indexHtmlPlugin = plugins
							.getPlugins()
							.find((v) => v.name === 'indexHtmlAddClientPlugin');
						if (indexHtmlPlugin) {
							return res.end(
								indexHtmlPlugin.transform(item!.handler(req, res).toString(), {
									filePath: 'index.html',
									requestUrl: requestFileName,
									isLentModule: true
								})
							);
						}
						return Promise.resolve(item?.handler(req, res)).then(res.end);
					}

					transform(requestFileName, plugins.getPlugins, lentInstance).then(
						(transformValue) => {
							const fileValue = transformValue || '';
							const etag = lentInstance.depend.getDepend(requestFileName)?.etag;
							res.setHeader('content-Type', 'text/javascript');
							if (etag) {
								res.setHeader('Etag', etag);
							}
							res.end(fileValue);
						}
					);
				})
				.listen(lentInstance.config.port, () => {
					console.log(`lent v${pkg.version} dev server running at:`);
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
