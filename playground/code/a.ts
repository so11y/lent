import { th } from './b';

export const t = `hello a.ts >>> ${th}`;

console.log('A file');

if (import.meta.hot) {
	import.meta.hot.accept(() => {
		console.log('a update');
	});
}
