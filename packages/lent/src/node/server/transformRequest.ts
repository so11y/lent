import { Lent } from './index';
import getEtag from 'etag';
import { getMaybeValue, handleInternal } from '../utils';
import { getPackageInfo } from 'local-pkg';
// import { ensureWatchedFile } from './watcher';

export const doTransform = async (rawUrl: string, lent: Lent) => {
	const [url] = handleInternal(rawUrl);

	const filePath: string = await getMaybeValue(
		await lent.pluginContainer.resolveId(url),
		'id',
		url
	);

	const loadResult = getMaybeValue(
		await lent.pluginContainer.load(filePath),
		'code'
	);

	if (loadResult === null) {
		throw new Error(`[lent error] loadResult null ${url}`);
	}
	const mod = await lent.moduleGraph.ensureEntryFromUrl(url);

	const code = getMaybeValue(
		await lent.pluginContainer.transform(loadResult, filePath),
		'code'
	);


	// ensureWatchedFile(lent.watcher, mod.file, lent.config.root);
	mod.etag = getEtag(code, { weak: true });
	return {
		code,
		mod
	};
};
