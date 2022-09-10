import { LentConfig } from '../../types/config';
import http from 'http';
import { ComposeLink } from '@lent/link';
import { resolve } from 'path';
import { Lent } from './index';
import { applyMiddleware } from './middlewares';
const pkg = require(resolve(__dirname, `../package.json`));

export function httpServer(lentConfig: LentConfig, lent: Lent) {
	let { port } = lentConfig;

	const middleware = new ComposeLink<
		[http.IncomingMessage, http.ServerResponse]
	>();
	applyMiddleware(lent, middleware);
	const server = http.createServer((req, res) => middleware.run(req, res));

	return {
		server,
		start() {
			server.listen(port, () => {
				console.log(`lent v${pkg.version} dev server running at:`);
				console.log(`> Local: http://localhost:${lentConfig.port}/`);
				console.log(
					`> running time ${Date.now() - lent.performance.startTime}ms`
				);
			});
		}
	};
}
