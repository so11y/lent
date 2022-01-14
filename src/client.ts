const dataMap = new Map<string, unknown>();

const createSocket = () => {
	console.log('[lent] connecting...');
	const ws = new WebSocket('ws://localhost:replace_socket_url');
	ws.addEventListener('open', () => {
		console.log('[lent] connected');
	});
	ws.addEventListener('message', (msg) => {
		try {
			const data = JSON.parse(msg.data);
			if (data.hot) {
				// eslint-disable-next-line no-empty
				if (dataMap.has(data.fileName)) {
				} else {
					window.location.reload();
				}
			}
		} catch (error) {
			console.log(console.log('[lent] message error'));
		}
	});
};
const createHot = () => {
	return {
		// accept() {}
	};
};

createSocket();

const hot = createHot();

Object.defineProperty(window, 'hot', {
	get() {
		return hot;
	}
});
