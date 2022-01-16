import path from 'path';
import fs from 'fs';
import { LentHttpInstance, TransformPlugin } from './types';
import { isLentRequest } from './share';

export const isHaveFile = (
	requireName: string,
	lentHttpInstance: LentHttpInstance
) => {
	let fileRoot = lentHttpInstance.config.root;
	const converFileName = isLentRequest(requireName);
	if (converFileName.includes('client')) fileRoot = __dirname;
	const filePath = path.join(fileRoot, converFileName);
	if (fs.existsSync(filePath)) {
		return filePath;
	}
	return false;
};

export const findFile = (
	requireName: string,
	fileExit: Array<string>,
	lentHttpInstance: LentHttpInstance
) => {
	const f = isHaveFile(requireName, lentHttpInstance);
	if (f) return f;
	for (const exitName of fileExit) {
		const f = isHaveFile(requireName + exitName, lentHttpInstance);
		if (f) {
			return f;
		}
	}
	return '';
};

export const transform = (
	requestFileName: string,
	plugins: () => Array<TransformPlugin>,
	lentHttpInstance: LentHttpInstance
) => {
	let fileData = '';
	const filePath = findFile(
		requestFileName,
		['.js', '.ts', '.css'],
		lentHttpInstance
	);

	const filterplugins = plugins().filter((v) => {
		if (requestFileName.endsWith(v.exit) || filePath.endsWith(v.exit)) {
			return true;
		} else if (
			v.exits?.some(
				(vv) => requestFileName.includes(vv) || filePath.endsWith(vv)
			)
		) {
			return true;
		}
	});
	if (filePath) {
		fileData = fs.readFileSync(filePath).toString();
	}
	if (filterplugins.length) {
		const fileUrl = {
			filePath: filePath || requestFileName,
			requestUrl: requestFileName
		};
		return plugins()
			.filter((v) => v.enforce === 'post')
			.reduce(
				(prev, next) =>
					prev.then((value) => next.handle(value, fileUrl, lentHttpInstance)),
				Promise.resolve(fileData)
			)
			.then((fileSoruce) => {
				return filterplugins.reduce(
					(prev, next) =>
						prev.then((value) =>
							next.transform(value, fileUrl, lentHttpInstance)
						),
					Promise.resolve(fileSoruce)
				);
			})
			.catch((e) => {
				console.log('[lent error]', e.message);
			});
	}
	return Promise.resolve(null);
};
