import { th } from './b';

export const t = `hello a.ts >>> ${th}`;

console.log('---- A');

if (import.meta.hot) {
	import.meta.hot.accept(() => {
		console.log('a update s555f');
	});
}
