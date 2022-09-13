import { Lent } from '../index';
import { ComposeLink, Next } from '@lent/link';
import { indexHtml } from './indexHtml';
import http from 'http';
import { transform } from './transform';
import { ignore } from './ignore';

export type Middleware = ComposeLink<
	[http.IncomingMessage, http.ServerResponse]
>;

interface MiddlewareUse {
	(
		req: http.IncomingMessage,
		res: http.ServerResponse,
		next: Next
	): void | Promise<void>;
}

export interface MiddlewarePlugin {
	(lent: Lent): MiddlewareUse;
	PostMiddleware?: MiddlewareUse;
}

export const applyMiddleware = async (lent: Lent) => {
	const middlewareManagement: Middleware = new ComposeLink();
	const postMiddleware = [];
	for (const middleware of lent.config.middleware) {
		const middle = await middleware(lent);
		if (middleware.PostMiddleware) {
			postMiddleware.push(middleware.PostMiddleware);
		}
		middlewareManagement.use(middle);
	}
	middlewareManagement.use(ignore());
	middlewareManagement.use(indexHtml(lent));
	middlewareManagement.use(transform(lent));
	for (const middleware of postMiddleware) {
		middlewareManagement.use(middleware);
	}
	return middlewareManagement;
};
