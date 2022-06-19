import { getDependsParent, setDependsAddHash } from 'src/depends';
import { addFileChange } from '../watchFile';
import { LentPlugin } from './preCompose';

export const handleFileWatchPlugin: LentPlugin = (l) => {
	const setFileEtag = (requestUrl: string, isSend: boolean) => {
		const dependModule = l.depend.getDepend(requestUrl);
		dependModule.etag = Date.now().toString();
		if (isSend) {
			const moduleParent = getDependsParent(requestUrl, l.depend);
			console.log('sxsx', requestUrl, moduleParent);
			if (moduleParent.length) {
				setDependsAddHash([...moduleParent.slice(1), requestUrl], l.depend);
			}
			console.log('sxsx222', requestUrl, moduleParent);
			l.socket.sendSocket({
				hotModule: {
					fileName: requestUrl,
					parent: moduleParent
				},
				hot: true
			});
		}
	};
	l.plugin.addPlugins({
		name: 'handleFileWatchPlugin',
		enforce: 'post',
		transform: (v, file, i) => {
			const dependModule = i.depend.getDepend(file.requestUrl);
			setFileEtag(file.requestUrl, false);
			if (dependModule && file.filePath && !file.isLentModule) {
				addFileChange(i, file, () => {
					setFileEtag(file.requestUrl, true);
				});
			}
			return v;
		}
	});
};
