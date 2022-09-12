import { LentConfig } from './config';
import {
	CustomPluginOptions,
	LoadResult,
	Plugin as RollupPlugin,
	PluginContext,
	ResolveIdResult,
	TransformPluginContext,
	TransformResult
} from 'rollup';
import { Lent } from 'src/node/server';
export type ServerHook = (
	lent: Lent
) => (() => void) | void | Promise<(() => void) | void>;

export interface Plugin extends RollupPlugin {
	enforce?: 'pre' | 'post';
	// serveStart?: (config: Lent) => void;
	// configResolved?: (lent: Lent) => void | Promise<void>;
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
