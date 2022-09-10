import { Lent } from '../index';
import { ComposeLink } from '@lent/link';
import { indexHtml } from './index-html';
import http from 'http';

export const applyMiddleware = (
	lent: Lent,
	middleware: ComposeLink<[http.IncomingMessage, http.ServerResponse]>
) => {
	middleware.use(indexHtml(lent));
};
