import { Lent } from './index';
import getEtag from 'etag';
import { getMaybeValue, handleInternal } from '../utils';
import { getPackageInfo } from 'local-pkg';
// import { ensureWatchedFile } from './watcher';

export const doTransform = async (rawUrl: string, lent: Lent) => {
	let [url, isInternal] = handleInternal(rawUrl);
	let path: string = url;

	if (!isInternal) {
		path = getMaybeValue(await lent.pluginContainer.resolveId(url), 'id', url);
	}

	let loadResult = getMaybeValue(await lent.pluginContainer.load(path), 'code');

	if (loadResult === null) {
		throw new Error(`[lent error] loadResult null ${url}`);
	}
	const code = getMaybeValue(
		await lent.pluginContainer.transform(loadResult, url),
		'code'
	);

	const mod = await lent.moduleGraph.ensureEntryFromUrl(url);
	// ensureWatchedFile(lent.watcher, mod.file, lent.config.root);
	mod.etag = getEtag(code, { weak: true });
	return {
		code,
		mod
	};
};
