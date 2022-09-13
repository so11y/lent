import {
	CustomPluginOptions,
	LoadResult,
	Plugin as RollupPlugin,
	PluginContext,
	ResolveIdResult,
	TransformPluginContext,
	TransformResult
} from 'rollup';
import { ModuleNode } from '../node/server/moduleGraph';
import { Lent } from '../node/server/index';
export type ServerHook = (
	lent: Lent
) => (() => void) | void | Promise<(() => void) | void>;

export interface HmrContext {
	file: string;
	timestamp: number;
	modules: ModuleNode | undefined;
	read: () => Promise<string>;
	server: Lent;
}

export interface Plugin extends RollupPlugin {
	enforce?: 'pre' | 'post';
	// serveStart?: (config: Lent) => void;
	// configResolved?: (lent: Lent) => void | Promise<void>;
	handleHotUpdate?(ctx: HmrContext): void | Promise<ModuleNode | void>;
	configureServer?: ServerHook;
	transformIndexHtml?: (html: string) => Promise<string> | string;
	resolveId?(
		this: PluginContext,
		source: string,
		importer: string | undefined,
		options: { custom?: CustomPluginOptions }
	): Promise<ResolveIdResult> | ResolveIdResult;
	load?(this: PluginContext, id: string): Promise<LoadResult> | LoadResult;
	transform?(
		this: TransformPluginContext,
		code: string,
		id: string
	): Promise<TransformResult> | TransformResult;
}
