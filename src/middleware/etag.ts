import { handleUrl } from '../share';
import { MiddlewareHttp } from '../types';
import { MiddlewareNext } from './middleware';

export default (middlewareHttp: MiddlewareHttp, next: MiddlewareNext) => {
	const { http, lentInstance } = middlewareHttp;
	const [requestFileName] = handleUrl(http.req.url);
	const model = lentInstance.depend.getDepend(requestFileName);
	if (
		model &&
		(http.req.headers['if-none-match'] === model.etag ||
			model.isLentModule === true)
	) {
		http.res.statusCode = 304;
		return http.res.end();
	}
	if (requestFileName.endsWith('.map')) {
		return http.res.end();
	}
	middlewareHttp.mate.requestFileName = requestFileName;
	next();
};
