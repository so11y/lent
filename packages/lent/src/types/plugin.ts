import { LentConfig } from './config';
import {
	CustomPluginOptions,
	LoadResult,
	Plugin as RollupPlugin,
	ResolveIdResult,
	TransformPluginContext,
	TransformResult
} from 'rollup';

export interface PluginContext {}

export interface Plugin extends RollupPlugin {
	enforce?: 'pre' | 'post';
	configResolved?: (config: LentConfig) => void | Promise<void>;
	transformIndexHtml?: (html: string) => Promise<string> | string;
	resolveId?(
		this: PluginContext,
		source: string,
		importer: string | undefined,
		options: { custom?: CustomPluginOptions },
		ssr?: boolean
	): Promise<ResolveIdResult> | ResolveIdResult;
	load?(
		this: PluginContext,
		id: string,
		ssr?: boolean
	): Promise<LoadResult> | LoadResult;
	transform?(
		this: TransformPluginContext,
		code: string,
		id: string,
		ssr?: boolean
	): TransformResult;
}

