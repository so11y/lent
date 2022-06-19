import { WebSocketServer } from 'ws';

export const createWss = () => {
	const webSocket = new WebSocketServer({
		noServer: true
	});
	const sendSocket = (v: object) => {
		webSocket.clients.forEach((socket) => {
			socket.send(JSON.stringify(v));
		});
	};
	webSocket.on('connection', (socket) => {
		socket.send(JSON.stringify({ type: 'connected' }));
		// socket.on("message", (msg) => {})
	});
	return {
		webSocket,
		sendSocket
	};
};
