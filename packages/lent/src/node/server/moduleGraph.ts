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
	isExternal = false;
	etag?: string;

	constructor(url: string) {
		this.url = url;
		this.type = url.endsWith('.css') ? 'css' : 'js';
	}
	get injectLastHMRTimestamp(): string {
		return this.lastHMRTimestamp ? `?t=${this.lastHMRTimestamp}` : '';
	}
}

export class ModuleGraph {
	urlToModuleMap = new Map<string, ModuleNode>();
	idToModuleMap = new Map<string, ModuleNode>();
	// vite中也许是这里标准化子模块path路径
	// 可能是有不可避免的重复 比如 代码中是 ./a  浏览器请求是/a
	// 如果是多层的 ../../../a 也许处理的没有那么完美
	// 所以可能有重复的url模块,然后都是对应的一个真正文件path
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
