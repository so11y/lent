import fs from 'fs';
import { Lent } from './index';
import { ModuleNode } from './moduleGraph';

export const handelChange = (lent: Lent, path: string, stats?: fs.Stats) => {
	if (path.endsWith('.html')) {
		lent.socket.sendSocket({
			type: 'full-reload'
		});
	}
	const mod = lent.moduleGraph.getModulesByFile(path);
	if (mod) {
		cleanMod(mod!);
		const [needReload, updateMod, type] = findUpdateMod(mod);
		console.log(
			`[Lent ${type == 'hot' ? 'HMR' : 'WDS'}] update file ${mod.url}`
		);
		lent.socket.sendSocket({
			name: updateMod?.url,
			type,
			hot: needReload,
			time: updateMod?.lastHMRTimestamp
		});
	}
};

const cleanMod = (mod: ModuleNode) => {
	const seen: Set<ModuleNode> = new Set();
	const time = Date.now();
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
