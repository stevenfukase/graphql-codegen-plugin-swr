import type { ClientSideBasePluginConfig, LoadedFragment, ParsedConfig } from '@graphql-codegen/visitor-plugin-common';
import { ClientSideBaseVisitor } from '@graphql-codegen/visitor-plugin-common';
import type { GraphQLSchema, OperationDefinitionNode } from 'graphql';
import type { RawSWRPluginConfig } from './config';
export interface SWRPluginConfig extends ClientSideBasePluginConfig {
    rawRequest: boolean;
    excludeQueries: string | string[];
    useSWRInfinite: string | string[];
    autogenSWRKey: boolean;
}
export interface Operation {
    node: OperationDefinitionNode;
    documentVariableName: string;
    operationType: string;
    operationResultType: string;
    operationVariablesTypes: string;
}
export interface ComposeQueryHandlerConfig {
    autogenKey: SWRPluginConfig['autogenSWRKey'];
    infinite: boolean;
    rawRequest: SWRPluginConfig['rawRequest'];
    typesPrefix: ParsedConfig['typesPrefix'];
    typesSuffix: ParsedConfig['typesSuffix'];
}
export declare class SWRVisitor extends ClientSideBaseVisitor<RawSWRPluginConfig, SWRPluginConfig> {
    private _operationsToInclude;
    private _enabledInfinite;
    constructor(schema: GraphQLSchema, fragments: LoadedFragment[], rawConfig: RawSWRPluginConfig);
    protected buildOperation(node: OperationDefinitionNode, documentVariableName: string, operationType: string, operationResultType: string, operationVariablesTypes: string): string;
    get sdkContent(): string;
}
