import Http from 'http';
import path from 'path';
import { Socket } from 'net';
import { ComposeLink } from './middleware/middleware';
import {
	LentHttpInstance,
	MiddlewareHttp,
	Router as TypeRouter
} from './types';
import etagMiddle from './middleware/etag';
import routerMiddle from './middleware/router';
import transformMiddle from './middleware/transform';
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

			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			const middleware = new ComposeLink<MiddlewareHttp>();
			middleware.use(etagMiddle).use(routerMiddle);
			lentInstance.middle?.forEach((v) => middleware.use(v));
			middleware.use(transformMiddle);
			http
				.on('request', (req, res) => {
					middleware.run({
						lentInstance,
						http: {
							req,
							res
						},
						mate: {}
					});
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
