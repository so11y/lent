import aa from './a';

console.log(aa, '---');
if (import.meta.hot) {
	import.meta.hot.accept(() => {
		console.log('---');
	});
}
