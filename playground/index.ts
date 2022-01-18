import { t } from './code/a';
import './index.css';
// import { isArray } from 'rolling-way';
// import vvv from 'vue';

// vvv.createApp({
//     template: "<div>{{helloLent}}</div>",
//     setup() {
//         return {
//             helloLent: 'hello lent'
//         };
//     }
// }).mount('#app');

// console.log(isArray([]));

console.log('hello wolrd');
console.log(t, 'good');

if (import.meta.hot) {
	import.meta.hot.accept(() => {
		console.log('----');
	});
}
