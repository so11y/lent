const dataMap = new Map<string, () => void>();
const importNewFile = (hotModule: string, time: string) => {
	console.log(hotModule,'-----');
	import(`${hotModule}?import&t=${time}`).then(() => {
		console.log(`[lent hmr] hot update file ${hotModule}`);
		dataMap.get(hotModule)?.();
	});
};

(() => {
	console.log('[lent] connecting...');
	const ws = new WebSocket('ws://localhost:__lent__socket_port');
	ws.addEventListener('open', () => {
		console.log('[lent] connected');
	});
	ws.addEventListener('message', (msg) => {
		try {
			const { type, name, time } = JSON.parse(msg.data);
			if (type === 'full-reload') {
				window.location.reload();
			} else if (type == 'hot') {
				if (name) {
					importNewFile(name, time);
				} else {
					window.location.reload();
				}
			}
			// if (hot) {
			// 	const getParents = hotModule.parent.filter((v: any) => dataMap.has(v));
			// 	const findLatelyHotParent = getParents[getParents.length - 1];
			// 	// eslint-disable-next-line no-empty

			// }
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
