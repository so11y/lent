import fs from 'fs';
import { Lent } from './index';

export const handelChange = (lent: Lent, path: string, stats?: fs.Stats) => {
	if (path.endsWith('.html')) {
		lent.socket.sendSocket({
			type: 'full-reload',
		});
	}
};
