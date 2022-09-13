import http from 'http';
import { Lent } from '../index';
import { join } from 'path';
import { readFileSync } from 'fs';
import { sortUserPlugins } from '../../utils';
import { Next } from '@lent/link/';
import { send } from '../send';

export const indexHtml = (lent: Lent) => {
	return async (
		req: http.IncomingMessage,
		res: http.ServerResponse,
		next: Next
	) => {
		if (req.url === '/') {
			const indexPath = join(lent.config.root, './index.html');

			const htmlPlugin = sortUserPlugins(lent.config.plugins)
				.flat()
				.filter((v) => v.transformIndexHtml);

			const htmlCode = await htmlPlugin.reduce((prev, next) => {
				return prev.then((code) => next.transformIndexHtml!(code));
			}, Promise.resolve(readFileSync(indexPath).toString()));

			return send(req, res, htmlCode, 'html');
		}
		next();
	};
};
