import { LentPlugin } from './preCompose';

export const handleSocketPortPlugin: LentPlugin = (l) => {
	l.plugin.addPlugins({
		name: 'handleSocketPortPlugin',
		enforce: 'post',
		transform(fileData, fileUrl, v) {
			if (fileUrl.requestUrl.includes('client')) {
				return fileData.replace('replace_socket_url', v.config.port.toString());
			}
			return fileData;
		}
	});
};
