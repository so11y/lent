import { extname } from 'path';
import { cleanUrl, removeImportQuery, removeTimestampQuery } from '../utils';
import { PluginContainer } from './pluginContainer';
import { parse as parseUrl } from 'url';

export class ModuleNode {
	url: string;
	id: string | null = null;
	file: string | null = null;
	type: 'js' | 'css';
	importers = new Set<ModuleNode>();
	importedModules = new Set<ModuleNode>();
	lastHMRTimestamp = 0;
	isSelfAccepting = false;
	etag?: string;

	constructor(url: string) {
		this.url = url;
		this.type = url.endsWith('.css') ? 'css' : 'js';
	}
}

export class ModuleGraph {
	urlToModuleMap = new Map<string, ModuleNode>();
	idToModuleMap = new Map<string, ModuleNode>();
	fileToModulesMap = new Map<string, ModuleNode>();
	container: PluginContainer;

	constructor(container: PluginContainer) {
		this.container = container;
	}

	async getModuleByUrl(rawUrl: string): Promise<ModuleNode | undefined> {
		const [url] = await this.resolveUrl(rawUrl);
		return this.urlToModuleMap.get(url);
	}

	getModuleById(id: string): ModuleNode | undefined {
		return this.idToModuleMap.get(removeTimestampQuery(id));
	}

	getModulesByFile(file: string): ModuleNode | undefined {
		return this.fileToModulesMap.get(file);
	}

	async updateModuleInfo(
		mod: ModuleNode,
		importedModules: Set<string | ModuleNode>
	): Promise<Set<ModuleNode> | undefined> {
		const prevImports = mod.importedModules;
		const nextImports = (mod.importedModules = new Set());
		let noLongerImported: Set<ModuleNode> | undefined;

		for (const imported of importedModules) {
			const dep =
				typeof imported === 'string'
					? await this.ensureEntryFromUrl(imported)
					: imported;
			dep.importers.add(mod);
			nextImports.add(dep);
		}

		prevImports.forEach((dep) => {
			if (!nextImports.has(dep)) {
				dep.importers.delete(mod);
				if (!dep.importers.size) {
					(noLongerImported || (noLongerImported = new Set())).add(dep);
				}
			}
		});
		return noLongerImported;
	}

	async ensureEntryFromUrl(rawUrl: string): Promise<ModuleNode> {
		const [url, resolvedId] = await this.resolveUrl(rawUrl);
		let mod = this.urlToModuleMap.get(url);
		if (!mod) {
			mod = new ModuleNode(url);
			this.urlToModuleMap.set(url, mod);
			mod.id = resolvedId;
			this.idToModuleMap.set(resolvedId, mod);
			const file = (mod.file = cleanUrl(resolvedId));
			let fileMappedModules = this.fileToModulesMap.get(file);
			if (!fileMappedModules) {
				this.fileToModulesMap.set(file, mod);
			}
		}
		return mod;
	}

	async resolveUrl(url: string): Promise<[string, string]> {
		url = removeImportQuery(removeTimestampQuery(url));
		const resolvedId = (await this.container.resolveId(url))?.id || url;
		const ext = extname(cleanUrl(resolvedId));
		const { pathname, search, hash } = parseUrl(url);
		if (ext && !pathname!.endsWith(ext)) {
			url = pathname + ext + (search || '') + (hash || '');
		}
		return [url, resolvedId];
	}
}
