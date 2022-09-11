import http from 'http';
import { resolve } from 'path';
import { Lent } from './index';
const pkg = require(resolve(__dirname, `../package.json`));

export function httpServer(lent: Lent) {
	const {
		config: { port },
		performance: { startTime },
		middleware
	} = lent;
	const server = http.createServer((req, res) => middleware.run(req, res));
	return {
		server,
		start() {
			server.listen(port, () => {
				console.log(`lent v${pkg.version} dev server running at:`);
				console.log(`> Local: http://localhost:${port}/`);
				console.log(`> running time ${Date.now() - startTime}ms`);
			});
		}
	};
}
