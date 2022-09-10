import http from 'http';

const ignore_ = ['.ico', '.map'];

export const ignore = () => {
	return async (
		req: http.IncomingMessage,
		res: http.ServerResponse,
		next: Function
	) => {
		if (ignore_.some((v) => req.url?.endsWith(v))) {
			return res.end();
		}
		next();
	};
};
