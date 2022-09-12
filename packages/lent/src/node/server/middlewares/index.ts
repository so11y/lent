import { Lent } from '../index';
import { ComposeLink, Next } from '@lent/link';
import { indexHtml } from './indexHtml';
import http from 'http';
import { transform } from './transform';
import { ignore } from './ignore';

export type Middleware = ComposeLink<
	[http.IncomingMessage, http.ServerResponse]
>;

export interface MiddlewarePlugin {
	(lent: Lent): (
		req: http.IncomingMessage,
		res: http.ServerResponse,
		next: Next
	) => Promise<void>;
}

export const applyMiddleware = (lent: Lent) => {
	const middleware: Middleware = new ComposeLink();
	lent.config.middleware.forEach((v) => middleware.use(v(lent)));
	middleware.use(ignore());
	middleware.use(indexHtml(lent));
	middleware.use(transform(lent));
	return middleware;
};
