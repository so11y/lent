import { Lent } from './index';
import { ModuleNode } from './moduleGraph';
import { readFileSync, statSync } from 'fs';

export const handelChange = async (lent: Lent, file: string) => {
	if (file.endsWith('.html')) {
		return lent.socket.sendSocket({
			type: 'full-reload'
		});
	}
	if (file === lent.config.configPath && !lent.isRestarted) {
		console.log('[Lent] config file change restart ...');
		lent.isRestarted = true;
		await lent.restart();
		lent.isRestarted = false;
		return;
	}
	const mod = lent.moduleGraph.getModulesByFile(file);
	const timestamp = Date.now();
	const hmrContext = {
		file,
		timestamp,
		modules: mod,
		read: () => readModifiedFile(file),
		server: lent
	};

	for (const plugin of lent.config.plugins) {
		if (plugin.handleHotUpdate) {
			const filteredModules = await plugin.handleHotUpdate(hmrContext);
			if (filteredModules) {
				hmrContext.modules = filteredModules;
				break;
			}
		}
	}
	if (hmrContext.modules) {
		cleanMod(hmrContext.modules!, timestamp);
		const [needReload, updateMod, type] = findUpdateMod(hmrContext.modules);
		console.log(
			`[Lent ${type == 'hot' ? 'HMR' : 'WDS'}] update file ${
				hmrContext.modules.url
			}`
		);
		lent.socket.sendSocket({
			name: updateMod?.url,
			type,
			hot: needReload,
			time: updateMod?.lastHMRTimestamp
		});
	}
};

const cleanMod = (mod: ModuleNode, time: number) => {
	const seen: Set<ModuleNode> = new Set();
	const walkClean = (mod: ModuleNode) => {
		if (seen.has(mod)) {
			return;
		}
		seen.add(mod);
		mod.etag = undefined;
		mod.lastHMRTimestamp = time;
		mod.importers.forEach((importer) => {
			walkClean(importer);
		});
	};
	walkClean(mod);
};

const findUpdateMod = (mod: ModuleNode): [boolean, ModuleNode?, string?] => {
	if (mod.isSelfAccepting) {
		return [true, mod, 'hot'];
	}
	if (!mod.importers.size) {
		return [true, mod, 'full-reload'];
	}
	for (const parentMod of mod.importers) {
		return findUpdateMod(parentMod);
	}
	return [false];
};

async function readModifiedFile(file: string): Promise<string> {
	const content = readFileSync(file, 'utf-8');
	if (!content) {
		const mtime = statSync(file).mtimeMs;
		await new Promise((r) => {
			let n = 0;
			const poll = async () => {
				n++;
				const newMtime = statSync(file).mtimeMs;
				if (newMtime !== mtime || n > 10) {
					r(0);
				} else {
					setTimeout(poll, 10);
				}
			};
			setTimeout(poll, 10);
		});
		return readFileSync(file, 'utf-8');
	} else {
		return content;
	}
}
