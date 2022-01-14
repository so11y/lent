import { WebSocketServer, WebSocket } from 'ws';

export const createWss = () => {
	const webSocket = new WebSocketServer({
		noServer: true
	});
	let socket_: WebSocket = null;
	const sendSocket = (v: object) => {
		socket_.send(JSON.stringify(v));
	};
	webSocket.on('connection', (socket) => {
		socket_ = socket;
		socket.send(JSON.stringify({ type: 'connected' }));
		// socket.on("message", (msg) => {})
	});
	return {
		webSocket,
		sendSocket
	};
};
