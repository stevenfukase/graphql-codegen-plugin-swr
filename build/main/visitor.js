"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SWRVisitor = void 0;
const visitor_plugin_common_1 = require("@graphql-codegen/visitor-plugin-common");
const graphql_1 = require("graphql");
const micromatch_1 = __importDefault(require("micromatch"));
const pascal_case_1 = require("pascal-case");
const composeQueryHandler = (operation, config) => {
    const codes = [];
    const { node } = operation;
    const optionalVariables = !node.variableDefinitions ||
        node.variableDefinitions.length === 0 ||
        node.variableDefinitions.every((v) => v.type.kind !== graphql_1.Kind.NON_NULL_TYPE || v.defaultValue)
        ? '?'
        : '';
    const name = node.name.value;
    const pascalName = (0, pascal_case_1.pascalCase)(node.name.value);
    const responseType = config.rawRequest
        ? `SWRRawResponse<${operation.operationResultType}>`
        : operation.operationResultType;
    const variablesType = operation.operationVariablesTypes;
    codes.push(`use${pascalName}(${config.autogenKey ? '' : 'key: SWRKeyInterface, '}variables${optionalVariables}: ${variablesType}, config?: SWRConfigInterface<${responseType}, ClientError>) {
  return useSWR<${responseType}, ClientError>(${config.autogenKey
        ? `withKeyGenerator<${variablesType}>('${pascalName}', variables)`
        : 'key'}, () => sdk.${name}(variables), config);
}`);
    if (config.infinite) {
        codes.push(`use${pascalName}Infinite(${config.autogenKey ? '' : 'id: string, '}getKey: ${config.typesPrefix}SWRInfiniteKeyLoader${config.typesSuffix}<${responseType}, ${variablesType}>, variables${optionalVariables}: ${variablesType}, config?: SWRInfiniteConfiguration<${responseType}, ClientError>) {
  return useSWRInfinite<${responseType}, ClientError>(
    utilsForInfinite.generateGetKey<${responseType}, ${variablesType}>(${config.autogenKey
            ? `genKey<${variablesType}>('${pascalName}', variables)`
            : 'id'}, getKey),
    utilsForInfinite.generateFetcher<${responseType}, ${variablesType}>(sdk.${name}, variables),
    config);
}`);
    }
    return codes;
};
class SWRVisitor extends visitor_plugin_common_1.ClientSideBaseVisitor {
    _operationsToInclude = [];
    _enabledInfinite = false;
    constructor(schema, fragments, rawConfig) {
        super(schema, fragments, rawConfig, {
            excludeQueries: rawConfig.excludeQueries || null,
            useSWRInfinite: rawConfig.useSWRInfinite || null,
            autogenSWRKey: rawConfig.autogenSWRKey || false,
        });
        this._enabledInfinite =
            (this.config.useSWRInfinite &&
                typeof this.config.useSWRInfinite === 'string') ||
                (Array.isArray(this.config.useSWRInfinite) &&
                    this.config.useSWRInfinite.length > 0);
        const typeImport = this.config.useTypeImports ? 'import type' : 'import';
        this._additionalImports.push(`${typeImport} { ClientError } from 'graphql-request/dist/types';`);
        if (this.config.useTypeImports) {
            if (this._enabledInfinite) {
                this._additionalImports.push(`import type { SWRConfiguration as SWRConfigInterface, Key as SWRKeyInterface } from 'swr';`);
                this._additionalImports.push(`import type { SWRInfiniteConfiguration } from 'swr/infinite';`);
                this._additionalImports.push(`import useSWR from 'swr';`);
                this._additionalImports.push(`import useSWRInfinite from 'swr/infinite';`);
            }
            else {
                this._additionalImports.push(`import type { SWRConfiguration as SWRConfigInterface, Key as SWRKeyInterface } from 'swr';`);
                this._additionalImports.push(`import useSWR from 'swr';`);
            }
        }
        else if (this._enabledInfinite) {
            this._additionalImports.push(`import useSWR, { SWRConfiguration as SWRConfigInterface, Key as SWRKeyInterface } from 'swr';`);
            this._additionalImports.push(`import useSWRInfinite, { SWRInfiniteConfiguration } from 'swr/infinite';`);
        }
        else {
            this._additionalImports.push(`import useSWR, { SWRConfiguration as SWRConfigInterface, Key as SWRKeyInterface } from 'swr';`);
        }
    }
    buildOperation(node, documentVariableName, operationType, operationResultType, operationVariablesTypes) {
        this._operationsToInclude.push({
            node,
            documentVariableName,
            operationType,
            operationResultType,
            operationVariablesTypes,
        });
        return null;
    }
    get sdkContent() {
        const codes = [];
        const { config } = this;
        const disabledexcludeQueries = !config.excludeQueries ||
            (Array.isArray(config.excludeQueries) && !config.excludeQueries.length);
        const allPossibleActions = this._operationsToInclude
            .filter((o) => {
            if (o.operationType !== 'Query') {
                return false;
            }
            if (disabledexcludeQueries) {
                return true;
            }
            return !micromatch_1.default.isMatch(o.node.name.value, config.excludeQueries);
        })
            .map((o) => composeQueryHandler(o, {
            autogenKey: config.autogenSWRKey,
            infinite: this._enabledInfinite &&
                micromatch_1.default.isMatch(o.node.name.value, config.useSWRInfinite),
            rawRequest: config.rawRequest,
            typesPrefix: config.typesPrefix,
            typesSuffix: config.typesSuffix,
        }))
            .reduce((p, c) => p.concat(c), [])
            .map((s) => (0, visitor_plugin_common_1.indentMultiline)(s, 2));
        // Add type of SWRRawResponse
        if (config.rawRequest) {
            codes.push(`type SWRRawResponse<Data = any> = { data?: Data | undefined; extensions?: any; headers: Headers; status: number; errors?: GraphQLError[] | undefined; };`);
        }
        // Add type of SWRInfiniteKeyLoader
        if (this._enabledInfinite) {
            codes.push(`export type ${config.typesPrefix}SWRInfiniteKeyLoader${config.typesSuffix}<Data = unknown, Variables = unknown> = (
  index: number,
  previousPageData: Data | null
) => [keyof Variables, Variables[keyof Variables] | null] | null;`);
        }
        codes.push(`export type KeyGenerator = <
  V extends Record<string, unknown> = Record<string, unknown>,
>(
  name: string,
  object?: V
) => SWRKeyInterface;
const defaultKeyGenerator: KeyGenerator = <
  V extends Record<string, unknown> = Record<string, unknown>,
>(
  name: string,
  object = {} as V
) => [
  name,
  ...Object.keys(object)
    .sort()
    .map((key) => object[key]),
];`);
        // Add getSdkWithHooks function
        codes.push(`export function getSdkWithHooks(client: GraphQLClient,
  withKeyGenerator: KeyGenerator = defaultKeyGenerator,
  withWrapper: SdkFunctionWrapper = defaultWrapper
) {
  const sdk = getSdk(client, withWrapper);`);
        // Add the utility for useSWRInfinite
        if (this._enabledInfinite) {
            codes.push(`  const utilsForInfinite = {
    generateGetKey: <Data = unknown, Variables = unknown>(
      id: ${config.autogenSWRKey ? 'SWRKeyInterface' : 'string'},
      getKey: ${config.typesPrefix}SWRInfiniteKeyLoader${config.typesSuffix}<Data, Variables>
    ) => (pageIndex: number, previousData: Data | null) => {
      const key = getKey(pageIndex, previousData)
      return key ? [id, ...key] : null
    },
    generateFetcher: <Query = unknown, Variables = unknown>(query: (variables: Variables) => Promise<Query>, variables?: Variables) => (
        id: string,
        fieldName: keyof Variables,
        fieldValue: Variables[typeof fieldName]
      ) => query({ ...variables, [fieldName]: fieldValue } as Variables)
  }`);
        }
        // Add return statement for getSdkWithHooks function and close the function
        codes.push(`  return {
    ...sdk,
${allPossibleActions.join(',\n')}
  };
}`);
        // Add type of Sdk
        codes.push(`export type ${config.typesPrefix}SdkWithHooks${config.typesSuffix} = ReturnType<typeof getSdkWithHooks>;`);
        return codes.join('\n');
    }
}
exports.SWRVisitor = SWRVisitor;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidmlzaXRvci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy92aXNpdG9yLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7OztBQU1BLGtGQUcrQztBQUkvQyxxQ0FBOEI7QUFDOUIsNERBQTZCO0FBQzdCLDZDQUF3QztBQXVDeEMsTUFBTSxtQkFBbUIsR0FBRyxDQUMxQixTQUFvQixFQUNwQixNQUFpQyxFQUN2QixFQUFFO0lBQ1osTUFBTSxLQUFLLEdBQWEsRUFBRSxDQUFBO0lBQzFCLE1BQU0sRUFBRSxJQUFJLEVBQUUsR0FBRyxTQUFTLENBQUE7SUFDMUIsTUFBTSxpQkFBaUIsR0FDckIsQ0FBQyxJQUFJLENBQUMsbUJBQW1CO1FBQ3pCLElBQUksQ0FBQyxtQkFBbUIsQ0FBQyxNQUFNLEtBQUssQ0FBQztRQUNyQyxJQUFJLENBQUMsbUJBQW1CLENBQUMsS0FBSyxDQUM1QixDQUFDLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLEtBQUssY0FBSSxDQUFDLGFBQWEsSUFBSSxDQUFDLENBQUMsWUFBWSxDQUM1RDtRQUNDLENBQUMsQ0FBQyxHQUFHO1FBQ0wsQ0FBQyxDQUFDLEVBQUUsQ0FBQTtJQUNSLE1BQU0sSUFBSSxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFBO0lBQzVCLE1BQU0sVUFBVSxHQUFHLElBQUEsd0JBQVUsRUFBQyxJQUFJLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFBO0lBQzlDLE1BQU0sWUFBWSxHQUFHLE1BQU0sQ0FBQyxVQUFVO1FBQ3BDLENBQUMsQ0FBQyxrQkFBa0IsU0FBUyxDQUFDLG1CQUFtQixHQUFHO1FBQ3BELENBQUMsQ0FBQyxTQUFTLENBQUMsbUJBQW1CLENBQUE7SUFDakMsTUFBTSxhQUFhLEdBQUcsU0FBUyxDQUFDLHVCQUF1QixDQUFBO0lBRXZELEtBQUssQ0FBQyxJQUFJLENBQUMsTUFBTSxVQUFVLElBQ3pCLE1BQU0sQ0FBQyxV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