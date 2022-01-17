import path from 'path';
import fs from 'fs';
import { LentHttpInstance, TransformPlugin } from './types';
import { isLentRequest } from './share';

/**
 * 这块需要重点重构
 */
export const isHaveFile = (
	requireName: string,
	rawRequireName: string,
	lentHttpInstance: LentHttpInstance
): [string, boolean] => {
	let fileRoot = lentHttpInstance.config.root;
	// eslint-disable-next-line prefer-const
	let [converFileName, isLentStart] = isLentRequest(rawRequireName);

	if (isLentStart && converFileName.includes('client')) {
		fileRoot = __dirname;
		converFileName += '.js';
	} else if (isLentStart) {
		fileRoot = process.cwd();
		try {
			const fileMainEnter = require(path.join(
				process.cwd(),
				'/node_modules',
				converFileName,
				'/package.json'
			));
			converFileName = path.join(
				'/node_modules',
				converFileName,
				fileMainEnter
			);
		} catch (e) {
			console.warn(
				`[lent warn] no find module ${converFileName} do you have insatll ?`
			);
			return ['', false];
		}
	} else {
		converFileName = requireName;
	}

	const filePath = path.join(fileRoot, converFileName);

	if (fs.existsSync(filePath)) {
		return [filePath, isLentStart];
	}
	return ['', isLentStart];
};

export const findFile = (
	requireName: string,
	fileExit: Array<string>,
	lentHttpInstance: LentHttpInstance
): [string, boolean] => {
	const [f, isLentModule] = isHaveFile(
		requireName,
		requireName,
		lentHttpInstance
	);
	if (f) return [f, isLentModule];
	for (const exitName of fileExit) {
		const [f, isLentModule] = isHaveFile(
			requireName + exitName,
			requireName,
			lentHttpInstance
		);
		if (f) {
			return [f, isLentModule];
		}
	}
	return ['', isLentModule];
};

export const transform = (
	requestFileName: string,
	plugins: () => Array<TransformPlugin>,
	lentHttpInstance: LentHttpInstance
) => {
	if (requestFileName.endsWith('.map')) {
		return Promise.resolve(null);
	}

	let fileData = '';
	const [filePath, isLentModule] = findFile(
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
			filePath,
			requestUrl: requestFileName,
			isLentModule: !isLentModule
		};
		//这里可以单独抽离为一个库
		return plugins()
			.filter((v) => v.enforce === 'post')
			.reduce(
				(prev, next) =>
					prev.then((value) =>
						next.transform(value, fileUrl, lentHttpInstance)
					),
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
