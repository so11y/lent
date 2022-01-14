import { router, createHttp } from './lent-http';
import { LentHttpInstance } from './types';
import { createWatchFile, handleWatchFileEvent } from './watchFile';
import { depends } from './depends';
import { createWss } from './wss';
import { getConfig } from './getConfig';
import { plugins, applyComposePlugin } from './plugins/preCompose';

const lent = (): LentHttpInstance => {
	const lentInstance_ = {
		performance: {
			startTime: Date.now()
		},
		watchFileEvent: handleWatchFileEvent(),
		router: router(),
		plugin: plugins(),
		depend: depends(),
		config: null,
		socket: null,
		watch: null,
		http: null
	};
	lentInstance_.watch = createWatchFile(lentInstance_);
	lentInstance_.socket = createWss();
	lentInstance_.http = createHttp(lentInstance_);
	lentInstance_.config = getConfig(lentInstance_);
	applyComposePlugin(lentInstance_);
	return lentInstance_;
};

lent().http.start();
