import { LentConfig } from '../../types/config';
import { Plugin } from '../../types/plugin';
import * as acorn from 'acorn';
import {
	InputOptions,
	LoadResult,
	MinimalPluginContext,
	ModuleInfo,
	ModuleOptions,
	PartialNull,
	PartialResolvedId,
	PluginContext as RollupPluginContext,
	ResolvedId,
	RollupError,
	SourceDescription,
	TransformResult
} from 'rollup';
import { FSWatcher } from 'chokidar';
import { ensureWatchedFile } from './watcher';
import { join } from 'path';
import { isObject, normalizePath, sortUserPlugins } from '../utils';

type PluginContext = Omit<
	RollupPluginContext,
	| 'load'
	| 'cache'
	| 'emitAsset'
	| 'emitChunk'
	| 'getAssetFileName'
	| 'getChunkFileName'
	| 'isExternal'
	| 'moduleIds'
	| 'resolveId'
>;
export interface PluginContainer {
	options: InputOptions;
	buildStart(options: InputOptions): Promise<void>;
	resolveId(
		id: string,
		importer?: string,
		skip?: Set<Plugin>
	): Promise<PartialResolvedId | null>;
	transform(code: string, id: string): Promise<SourceDescription | null>;
	load(id: string): Promise<LoadResult | null>;
	close(): Promise<void>;
}

export const createPluginContainer = async (
	{ plugins, root, build: { rollupOptions } }: LentConfig,
	watcher?: FSWatcher
): Promise<PluginContainer> => {
	const MODULES = new Map();
	const watchFiles = new Set<string>();
	class Context implements PluginContext {
		meta: MinimalPluginContext['meta'] = {
			rollupVersion: '2.79.0',
			watchMode: true
		};
		_activePlugin: Plugin | null;
		_activeId: string | null = null;
		_activeCode: string | null = null;
		_resolveSkips?: Set<Plugin>;
		_addedImports: Set<string> | null = null;

		constructor(initialPlugin?: Plugin) {
			this._activePlugin = initialPlugin || null;
		}

		parse(code: string, opts: any = {}) {
			return acorn.parse(code, {
				sourceType: 'module',
				ecmaVersion: 'latest',
				locations: true,
				...opts
			});
		}

		async resolve(
			id: string,
			importer?: string,
			options?: { skipSelf?: boolean }
		) {
			let skips: Set<Plugin> | undefined;
			if (options?.skipSelf && this._activePlugin) {
				skips = new Set(this._resolveSkips);
				skips.add(this._activePlugin);
			}
			let out = await container.resolveId(id, importer, skips);
			if (typeof out === 'string') out = { id: out };
			return out as ResolvedId | null;
		}

		getModuleInfo(id: string) {
			let mod = MODULES.get(id);
			if (mod) return mod.info;
			mod = {
				info: {}
			};
			MODULES.set(id, mod);
			return mod.info;
		}

		getModuleIds() {
			return MODULES.keys();
		}

		addWatchFile(id: string) {
			watchFiles.add(id);
			(this._addedImports || (this._addedImports = new Set())).add(id);
			if (watcher) ensureWatchedFile(watcher, id, root);
		}

		getWatchFiles() {
			return [...watchFiles];
		}

		emitFile() {
			console.warn(`emitFile`, this._activePlugin!.name);
			return '';
		}

		setAssetSource() {
			console.warn(`setAssetSource`, this._activePlugin!.name);
		}

		getFileName() {
			console.warn(`getFileName`, this._activePlugin!.name);
			return '';
		}

		warn(e: string | RollupError) {
			console.warn(`warn`, e);
		}

		error(e: string | RollupError): never {
			throw e;
		}
	}
	class TransformContext extends Context {
		filename: string;
		originalCode: string;

		constructor(filename: string, code: string) {
			super();
			this.filename = filename;
			this.originalCode = code;
		}
	}

	const container = {
		options: await (async () => {
			let options = rollupOptions;
			for (const plugin of plugins) {
				if (!plugin.options) continue;
				options = (await (plugin.options as any).call({}, options)) || options;
			}
			return {
				acorn,
				...options
			};
		})(),

		async buildStart() {
			await Promise.all(
				plugins.map((plugin) => {
					if (plugin.buildStart) {
						return (plugin.buildStart as any).call(
							new Context(plugin) as any,
							container.options
						);
					}
				})
			);
		},

		async resolveId(
			rawId: string,
			importer = join(root, 'index.html'),
			skips: Set<Plugin> | undefined
		) {
			const ctx = new Context();
			ctx._resolveSkips = skips;

			let id: string | null = null;
			const partial: any = {};
			const plugins_ = sortUserPlugins(plugins);
			for (const plugin of plugins_) {
				if (!plugin.resolveId) continue;
				if (skips?.has(plugin)) continue;

				ctx._activePlugin = plugin;
				const result = await plugin.resolveId.call(
					ctx as any,
					rawId,
					importer,
					{}
				);
				if (!result) continue;

				if (typeof result === 'string') {
					id = result;
				} else {
					id = result.id;
					Object.assign(partial, result);
				}
				break;
			}

			if (id) {
				partial.id = normalizePath(id);
				return partial;
			} else {
				return null;
			}
		},

		async load(id: string) {
			const ctx = new Context();
			for (const plugin of plugins) {
				if (!plugin.load) continue;
				ctx._activePlugin = plugin;
				const result = await plugin.load.call(ctx as any, id);
				if (result != null) {
					return result;
				}
			}
			return null;
		},

		async transform(code: string, id: string) {
			const ctx = new TransformContext(id, code);
			const plugins_ = sortUserPlugins(plugins);
			for (const plugin of plugins_) {
				if (!plugin.transform) continue;
				ctx._activePlugin = plugin;
				ctx._activeId = id;
				ctx._activeCode = code;
				let result: TransformResult;
				try {
					result = await plugin.transform.call(ctx as any, code, id);
				} catch (e) {
					ctx.error(e as any);
				}
				if (!result) continue;
				if (isObject(result)) {
					code = result.code || '';
				} else {
					code = result;
				}
			}
			return {
				code
			};
		},

		async close() {
			if (closed) return;
			const ctx = new Context();
			await Promise.all(
				plugins.map((p) => p.buildEnd && (p.buildEnd as any).call(ctx as any))
			);
			await Promise.all(
				plugins.map(
					(p) => p.closeBundle && (p.closeBundle as any).call(ctx as any)
				)
			);
			closed = true;
		}
	};

	return container;
};
