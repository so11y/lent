import { t } from './test';
import './index.css';

console.log('hello wolrd index file ');
console.log(t);

if (import.meta.hot) {
	import.meta.hot.accept(() => {
		console.log('----');
	});
}
