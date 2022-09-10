import { existsSync } from 'node:fs';
import path from 'node:path';
import os from 'os'

export function slash(p: string): string {
  return p.replace(/\\/g, '/')
}
export const findFile = (files: Array<string>, root: string) => {
	const filePath = files.find((filePath) =>
		existsSync(path.join(root, filePath))
	);
	if (filePath) {
		return path.join(root, filePath);
	}
};

export const isWindows = os.platform() === 'win32'

export function normalizePath(id: string): string {
  return path.posix.normalize(isWindows ? slash(id) : id)
}
export function isObject(value: unknown): value is Record<string, any> {
  return Object.prototype.toString.call(value) === '[object Object]'
}