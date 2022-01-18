import { t } from './code/a';
import './index.css';
// import { isArray } from 'rolling-way';
import vvv from 'vue';

vvv.createApp({
    template:"<div>{{hello}}</div>",
	setup() {
		return {
			hello: 'hello nihao'
		};
	}
}).mount('#app');

// console.log(vvv.createApp,"sx678678sx");
// import roll from 'rollup';

// console.log(isArray([]));
// console.log(roll);

console.log('hello wolrd 454523423445456767575465465675');
console.log(t, 'good');

if (import.meta.hot) {
	import.meta.hot.accept(() => {
		console.log('----');
	});
}
