import path from 'path';
import fs from 'fs';
import { LentHttpInstance, TransformPlugin } from './types';
import { isLentRequest } from './share';
import resolveId from 'resolve';

const findPackage = (moduleName) => {
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	return new Promise<Record<string, any>>((r) => {
		resolveId(
			moduleName,
			{
				packageFilter(packages) {
					r(packages);
				}
			},
			// eslint-disable-next-line @typescript-eslint/no-empty-function
			() => {}
		);
	});
};

const whiteNames = ['client'];

/**
 * 这块需要重点重构
 */
export const isHaveFile = async (
	requireName: string,
	rawRequireName: string,
	lentHttpInstance: LentHttpInstance
): Promise<[string, boolean, boolean]> => {
	let fileRoot = lentHttpInstance.config.root;
	let isModulesFile = false;
	// eslint-disable-next-line prefer-const
	let [convertFileName, isLentStart] = isLentRequest(rawRequireName);
	if (isLentStart && whiteNames.some((v) => convertFileName === v)) {
		fileRoot = __dirname;
		convertFileName += '.js';
	} else if (isLentStart) {
		fileRoot = process.cwd();
		try {
			const filePackage = await findPackage(convertFileName);
			const fileRoot = filePackage.module || filePackage.main;
			if (filePackage.module) {
				isModulesFile = true;
			}
			convertFileName = path.join('/node_modules', convertFileName, fileRoot);
		} catch (e) {
			console.warn(
				`[lent warn] no find module ${convertFileName} do you have install ?`
			);
			return ['', false, false];
		}
	} else {
		convertFileName = requireName;
	}

	const filePath = path.join(fileRoot, convertFileName);

	if (fs.existsSync(filePath)) {
		return [filePath, isLentStart, isModulesFile];
	}
	return ['', isLentStart, false];
};

export const findFile = async (
	requireName: string,
	fileExit: Array<string>,
	lentHttpInstance: LentHttpInstance
): Promise<[string, boolean, boolean]> => {
	const [f, isLentModule, isModulesFile] = await isHaveFile(
		requireName,
		requireName,
		lentHttpInstance
	);
	if (f) return [f, isLentModule, isModulesFile];
	for (const exitName of fileExit) {
		const [f, isLentModule] = await isHaveFile(
			requireName + exitName,
			requireName,
			lentHttpInstance
		);
		if (f) {
			return [f, isLentModule, isModulesFile];
		}
	}
	return ['', isLentModule, isModulesFile];
};

export const transform = async (
	requestFileName: string,
	plugins: () => Array<TransformPlugin>,
	lentHttpInstance: LentHttpInstance
) => {
	if (requestFileName.endsWith('.map')) {
		return Promise.resolve(null);
	}

	let fileData = '';
	const [filePath, isLentModule, isModulesFile] = await findFile(
		requestFileName,
		lentHttpInstance.config.extensions,
		lentHttpInstance
	);

	const filterPlugins = plugins().filter((v) => {
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
	const fileUrl = {
		filePath,
		requestUrl: requestFileName,
		isLentModule: isLentModule,
		isModulesFile
	};
	const reduces = (prev: Promise<string>, next: TransformPlugin) => {
		return prev.then((value) =>
			next.transform(value, fileUrl, lentHttpInstance)
		);
	};
	//这里可以单独抽离为一个库
	return plugins()
		.filter((v) => v.enforce === 'pre')
		.reduce(reduces, Promise.resolve(fileData))
		.then((fileSource) =>
			filterPlugins.reduce(reduces, Promise.resolve(fileSource))
		)
		.then((fileSource) => {
			return plugins()
				.filter((v) => v.enforce === 'post')
				.reduce(reduces, Promise.resolve(fileSource));
		})
		.catch((e) => {
			console.log('[lent error]', e);
		});
};
