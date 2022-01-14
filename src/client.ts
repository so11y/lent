const dataMap = new Map<string, () => void>();
const importNewFile = async (hotModule: string) => {
	await import(`${hotModule}?import&t=${Date.now()}`);
	console.log(`[lent hmr] hot update file ${hotModule}`);
};

(() => {
	console.log('[lent] connecting...');
	const ws = new WebSocket('ws://localhost:replace_socket_url');
	ws.addEventListener('open', () => {
		console.log('[lent] connected');
	});
	ws.addEventListener('message', async (msg) => {
		try {
			const { hotModule, hot } = JSON.parse(msg.data);
			if (hot) {
				// eslint-disable-next-line no-empty
				if (hotModule.parent && dataMap.has(hotModule.parent)) {
					await importNewFile(hotModule.parent);
				} else if (hotModule.fileName && dataMap.has(hotModule.fileName)) {
					importNewFile(hotModule.fileName);
				} else {
					window.location.reload();
				}
			}
		} catch (error) {
			console.log(console.log('[lent] message error'));
		}
	});
})();

export const createHotContext = (requestFileName: string) => {
	return {
		accept(callback: () => void) {
			if (!dataMap.has(requestFileName)) {
				dataMap.set(requestFileName, callback);
			}
		}
	};
};
