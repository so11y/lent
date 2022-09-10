import { existsSync } from 'node:fs';
import path from 'node:path';
import os from 'os';
import { Plugin } from '../types/plugin';
import { resolve } from 'path';
const queryRE = /\?.*$/s;
const hashRE = /#.*$/s;
const importQueryRE = /(\?|&)import=?(?:&|$)/;
const trailingSeparatorRE = /[\?&]$/;
const timestampRE = /\bt=\d{13}&?\b/;

export function slash(p: string): string {
	return p.replace(/\\/g, '/');
}
export const findFile = (files: Array<string>, root: string) => {
	const filePath = files.find((filePath) =>
		existsSync(path.join(root, filePath))
	);
	if (filePath) {
		return path.join(root, filePath);
	}
};

export const isWindows = os.platform() === 'win32';

export function normalizePath(id: string): string {
	return path.posix.normalize(isWindows ? slash(id) : id);
}
export function isObject(value: unknown): value is Record<string, any> {
	return Object.prototype.toString.call(value) === '[object Object]';
}

export function sortUserPlugins(plugins: Plugin[]): Plugin[] {
	const prePlugins: Plugin[] = [];
	const postPlugins: Plugin[] = [];
	const normalPlugins: Plugin[] = [];
	plugins.forEach((p) => {
		if (p.enforce === 'pre') prePlugins.push(p);
		else if (p.enforce === 'post') postPlugins.push(p);
		else normalPlugins.push(p);
	});

	return [...prePlugins, ...normalPlugins, ...postPlugins];
}

export const cleanInternalUrl = (url: string): string => {
	return url.replace('/@lent/', '');
};

export const cleanUrl = (url: string): string =>
	url.replace(hashRE, '').replace(queryRE, '');

export function removeImportQuery(url: string): string {
	return url.replace(importQueryRE, '$1').replace(trailingSeparatorRE, '');
}

export function removeTimestampQuery(url: string): string {
	return url.replace(timestampRE, '').replace(trailingSeparatorRE, '');
}

export function getMaybeValue(source: any, key: string, defaultValue?: any) {
	if (typeof source === 'string') {
		return source;
	}
	if (source && isObject(source) && source[key]) {
		return source[key];
	}
	return defaultValue;
}

const whites = ['client'];
export const handleInternal = (url: string): [string, boolean] => {
	let url_ = cleanInternalUrl(url);
	let isInternal = false;
	if (url.startsWith('/@lent/') && whites.includes(url_)) {
		url_ = resolve(resolve('lent'), `./dist/${url_}.js`);
		isInternal = true;
	}
	return [removeTimestampQuery(removeImportQuery(url_)), false];
};
