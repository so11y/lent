import { Lent } from '../index';
import { ComposeLink } from '@lent/link';
import { indexHtml } from './index-html';
import http from 'http';
import { transform } from './transform';

export const applyMiddleware = (
	lent: Lent,
	middleware: ComposeLink<[http.IncomingMessage, http.ServerResponse]>
) => {
	middleware.use(indexHtml(lent)).use(transform(lent));
};
