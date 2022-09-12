import http from 'http';
import { Next } from '@lent/link/';

const ignore_ = ['.ico', '.map'];

export const ignore = () => {
	return async (
		req: http.IncomingMessage,
		res: http.ServerResponse,
		next: Next
	) => {
		if (ignore_.some((v) => req.url?.endsWith(v))) {
			return res.end();
		}
		next();
	};
};
