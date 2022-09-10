import chokidar, { FSWatcher } from 'chokidar';
import { resolve } from 'path';
import { existsSync } from 'fs';

export const createWatcher = (root: string) => {
	return chokidar.watch(resolve(root), {
		ignored: ['**/node_modules/**', '**/.git/**'],
		ignoreInitial: true,
		ignorePermissionErrors: true,
		disableGlobbing: true
	}) as FSWatcher;
};

export function ensureWatchedFile(
	watcher: FSWatcher,
	file: string | null,
	root: string
): void {
	if (
		file &&
		!file.startsWith(root + '/') &&
		!file.includes('\0') &&
		existsSync(file)
	) {
		watcher.add(resolve(file));
	}
}
