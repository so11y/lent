import { t } from './code/a';
import './index.css';
console.log('hello wolrd');
console.log(t, 'good');

if (import.meta.hot) {
	import.meta.hot.accept(() => {
		console.log('----');
	});
}
