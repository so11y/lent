import { e } from 'vitest/dist/index-5f09f4d0';

const dataMap = new Map<string, () => void>();
const importNewFile = (hotModule: string, time: string) => {
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
			if (type === 'full-reload' || !name) {
				window.location.reload();
			} else if (type == 'hot') {
				importNewFile(name, time);
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
