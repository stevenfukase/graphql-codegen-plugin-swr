import { extname } from 'path'

import type {
  Types,
  PluginValidateFn,
  PluginFunction,
} from '@graphql-codegen/plugin-helpers'
import { oldVisit } from '@graphql-codegen/plugin-helpers'
import type { LoadedFragment } from '@graphql-codegen/visitor-plugin-common'
import type { GraphQLSchema, FragmentDefinitionNode } from 'graphql'
import { concatAST, Kind } from 'graphql'

import type { RawSWRPluginConfig } from './config'
import { SWRVisitor } from './visitor'

export const plugin: PluginFunction<RawSWRPluginConfig> = (
  schema: GraphQLSchema,
  documents: Types.DocumentFile[],
  config: RawSWRPluginConfig,
) => {
  const allAst = concatAST(documents.map((v) => v.document))

  const allFragments: LoadedFragment[] = [
    // prettier-ignore
    ...(allAst.definitions.filter(
      (d) => d.kind === Kind.FRAGMENT_DEFINITION
    ) as FragmentDefinitionNode[]).map((fragmentDef) => ({
      node: fragmentDef,
      name: fragmentDef.name.value,
      onType: fragmentDef.typeCondition.name.value,
      isExternal: false,
    })),
    ...(config.externalFragments || []),
  ]

  const visitor = new SWRVisitor(schema, allFragments, config)
  oldVisit(allAst, { leave: visitor })
  return {
    prepend: visitor.getImports(),
    content: visitor.sdkContent,
  }
}

export const validate: PluginValidateFn<any> = async (
  _schema: GraphQLSchema,
  _documents: Types.DocumentFile[],
  _config: RawSWRPluginConfig,
  outputFile: string,
) => {
  if (extname(outputFile) !== '.ts') {
    throw new Error(`Plugin "typescript-swr" requires extension to be ".ts"!`)
  }
}

export { SWRVisitor }
