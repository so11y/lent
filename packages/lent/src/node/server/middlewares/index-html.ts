import http from 'http';
import { Lent } from '../index';
import { join } from 'path';
import { readFileSync } from 'fs';

export const indexHtml = (lent: Lent) => {
	return (
		req: http.IncomingMessage,
		res: http.ServerResponse,
		next: Function
	) => {
		if (req.url === '/') {
			const indexPath = join(lent.config.root, './index.html');
      return res.end(readFileSync(indexPath))
		}
    next();
	};
};
