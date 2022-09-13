import http from 'http';
import { resolve } from 'path';
import { Lent } from './index';
const pkg = require(resolve(__dirname, `../package.json`));

export function httpServer(lent: Lent) {
	const {
		config,
		performance: { startTime },
		middleware
	} = lent;
	const server = http.createServer((req, res) => middleware.run(req, res));
	const handleError = (error: Error & { code: string }) => {
		if (error.code === 'EADDRINUSE') {
			console.log(
				`port ${lent.config.port} already use, trying another one... `
			);
			server.listen(++lent.config.port);
			return;
		}
		console.error(error.message);
	};
	const startCall = () => {
		server.removeListener('error', handleError);
		console.log(`lent v${pkg.version} dev server running at:`);
		console.log(`> Local: http://localhost:${config.port}/`);
		console.log(`> running time ${Date.now() - startTime}ms`);
	};
	const lentServer = {
		server,
		start() {
			server.on('error', handleError);
			server.listen(config.port, startCall);
		},
		close() {
			return new Promise<void>((resolve, reject) => {
				lent.socket.webSocket.close();
				server.close((err) => {
					if (err) {
						reject(err);
					} else {
						resolve();
					}
				});
			});
		}
	};
	return lentServer;
}
