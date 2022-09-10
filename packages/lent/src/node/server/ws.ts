import { WebSocketServer } from 'ws';
import { Socket } from 'net';
import { Lent } from './index';

export const createSocket = (lent: Lent) => {
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
	});
	lent.server.server.on('upgrade', (req, socket, head) => {
		webSocket.handleUpgrade(req, socket as Socket, head, (ws) => {
			webSocket.emit('connection', ws, req);
		});
	});
	return {
		webSocket,
		sendSocket
	};
};
