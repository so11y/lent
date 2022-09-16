import http from 'http';
import { Lent } from '../index';
import { handleInternal } from '../../utils';
import { doTransform } from '../transformRequest';
import { send } from '../send';
import { ModuleNode } from '../moduleGraph';

const cachePromise = new Map<
	string,
	Promise<{
		code: string;
		mod: ModuleNode;
	}>
>();

export const transform = (lent: Lent) => {
	return async (req: http.IncomingMessage, res: http.ServerResponse) => {
		const [url] = handleInternal(req.url!);
		const mod = await lent.moduleGraph.getModuleByUrl(url);
		const handleResult = async () => {
			const { code, mod: transformMod } = await cachePromise.get(req.url!)!;
			cachePromise.delete(req.url!);
			send(req, res, code, transformMod.type, transformMod.etag);
		};

		const ifNoneMatch = req.headers['if-none-match'];
		if (ifNoneMatch && mod?.etag === ifNoneMatch) {
			res.statusCode = 304;
			return res.end();
		}
		if (url.endsWith('.map')) {
			return res.end();
		}
		if (cachePromise.has(req.url!)) {
			return await handleResult();
		}
		try {
			cachePromise.set(req.url!, doTransform(req.url!, lent));
			await handleResult();
		} catch (error) {
			console.log('[Lent Transform Error]', error);
			res.statusCode = 500;
			res.end((error as Error)?.message);
		}
	};
};
