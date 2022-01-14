import { t } from './test';

console.log('hello world', t);

if (import.meta.hot) {
	import.meta.hot.accept(() => {
		console.log('----');
	});
}
