const dataMap = new Map<string, () => void>();
const importNewFile = (hotModule: string) => {
	import(`${hotModule}?import&t=${Date.now()}`).then(() => {
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
			const { hotModule, hot } = JSON.parse(msg.data);
			if (hot) {
				const getParents = hotModule.parent.filter((v: any) => dataMap.has(v));
				const findLatelyHotParent = getParents[getParents.length - 1];
				// eslint-disable-next-line no-empty
				if (hotModule.fileName && dataMap.has(hotModule.fileName)) {
					importNewFile(hotModule.fileName);
				} else if (findLatelyHotParent) {
					importNewFile(findLatelyHotParent);
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
