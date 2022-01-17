import { t } from './code/a';
import './index.css';
// import roll from 'rollup';

// console.log(roll);

console.log('hello wolrd');
console.log(t, 'good');

if (import.meta.hot) {
	import.meta.hot.accept(() => {
		console.log('----');
	});
}
