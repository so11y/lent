import { Lent } from '../index';
import { ComposeLink } from '@lent/link';
import { indexHtml } from './index-html';
import http from 'http';
import { transform } from './transform';
import { ignore } from './ignore';

export const applyMiddleware = (
	lent: Lent,
	middleware: ComposeLink<[http.IncomingMessage, http.ServerResponse]>
) => {
	middleware.use(ignore()).use(indexHtml(lent)).use(transform(lent));
};
