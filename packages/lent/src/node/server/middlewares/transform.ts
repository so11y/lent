import http from 'http';
import { Lent } from '../index';
import { handleInternal } from '../../utils';
import { doTransform } from '../transformRequest';
import { send } from '../send';

export const transform = (lent: Lent) => {
	return async (req: http.IncomingMessage, res: http.ServerResponse) => {
		const [url] = handleInternal(req.url!);
		const mod = await lent.moduleGraph.getModuleByUrl(url);

		const ifNoneMatch = req.headers['if-none-match'];
		if (ifNoneMatch && mod?.etag === ifNoneMatch) {
			res.statusCode = 304;
			return res.end();
		}
		if (url.endsWith('.map')) {
			return res.end();
		}
		try {
			const { code, mod: transformMod } = await doTransform(req.url!, lent);
			send(req, res, code, transformMod.type, transformMod.etag);
		} catch (error) {
			console.log('[Lent Transform Error]', error);
			res.statusCode = 500;
			res.end((error as Error)?.message);
		}
	};
};
