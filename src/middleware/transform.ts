import { transform } from '../handleFile';
import { MiddlewareHttp } from '../types';
import { MiddlewareNext } from './middleware';

export default (middlewareHttp: MiddlewareHttp, next: MiddlewareNext) => {
	const { http, lentInstance, mate } = middlewareHttp;
	const plugins = lentInstance.plugin;
	transform(mate.requestFileName, plugins.getPlugins, lentInstance).then(
		(transformValue) => {
			const fileValue = transformValue || '';
			const etag = lentInstance.depend.getDepend(mate.requestFileName)?.etag;
			http.res.setHeader('content-Type', 'text/javascript');
			if (etag) {
				http.res.setHeader('Etag', etag);
			}
			http.res.end(fileValue);
		}
	);
	next();
};
