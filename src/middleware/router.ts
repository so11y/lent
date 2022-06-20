import { MiddlewareHttp } from '../types';
import { MiddlewareNext } from './middleware';

export default (middlewareHttp: MiddlewareHttp, next: MiddlewareNext) => {
	const { http, lentInstance, mate } = middlewareHttp;
	const item = lentInstance.router
		.getRouters()
		.find((v) => v.path === mate.requestFileName);

	const plugins = lentInstance.plugin;
	if (item) {
		const indexHtmlPlugin = plugins
			.getPlugins()
			.find((v) => v.name === 'indexHtmlAddClientPlugin');
		if (indexHtmlPlugin && mate.requestFileName === '/') {
			return http.res.end(
				indexHtmlPlugin.transform(
					item?.handler(http.req, http.res).toString(),
					{
						filePath: 'index.html',
						requestUrl: mate.requestFileName,
						isLentModule: true,
						isModulesFile: false
					}
				)
			);
		}
		return Promise.resolve(item?.handler(http.req, http.res)).then((v) =>
			http.res.end(v)
		);
	}
	next();
};
