import type { PluginValidateFn, PluginFunction } from '@graphql-codegen/plugin-helpers';
import type { RawSWRPluginConfig } from './config';
import { SWRVisitor } from './visitor';
export declare const plugin: PluginFunction<RawSWRPluginConfig>;
export declare const validate: PluginValidateFn<RawSWRPluginConfig>;
export { SWRVisitor };
