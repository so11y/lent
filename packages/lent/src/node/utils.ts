import { existsSync } from 'node:fs';
import path from 'node:path';

export const findFile = (files: Array<string>, root: string) => {
	const filePath = files.find((filePath) =>
		existsSync(path.join(root, filePath))
	);
	if (filePath) {
		return path.join(root, filePath);
	}
};
