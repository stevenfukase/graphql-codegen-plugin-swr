"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SWRVisitor = exports.validate = exports.plugin = void 0;
const path_1 = require("path");
const plugin_helpers_1 = require("@graphql-codegen/plugin-helpers");
const graphql_1 = require("graphql");
const visitor_1 = require("./visitor");
Object.defineProperty(exports, "SWRVisitor", { enumerable: true, get: function () { return visitor_1.SWRVisitor; } });
const plugin = (schema, documents, config) => {
    const allAst = (0, graphql_1.concatAST)(documents.map((v) => v.document));
    const allFragments = [
        // prettier-ignore
        ...allAst.definitions.filter((d) => d.kind === graphql_1.Kind.FRAGMENT_DEFINITION).map((fragmentDef) => ({
            node: fragmentDef,
            name: fragmentDef.name.value,
            onType: fragmentDef.typeCondition.name.value,
            isExternal: false,
        })),
        ...(config.externalFragments || []),
    ];
    const visitor = new visitor_1.SWRVisitor(schema, allFragments, config);
    (0, plugin_helpers_1.oldVisit)(allAst, { leave: visitor });
    return {
        prepend: visitor.getImports(),
        content: visitor.sdkContent,
    };
};
exports.plugin = plugin;
const validate = async (_schema, _documents, _config, outputFile) => {
    if ((0, path_1.extname)(outputFile) !== '.ts') {
        throw new Error(`Plugin "typescript-swr" requires extension to be ".ts"!`);
    }
};
exports.validate = validate;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvaW5kZXgudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBQUEsK0JBQThCO0FBTzlCLG9FQUEwRDtBQUcxRCxxQ0FBeUM7QUFHekMsdUNBQXNDO0FBeUM3QiwyRkF6Q0Esb0JBQVUsT0F5Q0E7QUF2Q1osTUFBTSxNQUFNLEdBQXVDLENBQ3hELE1BQXFCLEVBQ3JCLFNBQStCLEVBQy9CLE1BQTBCLEVBQzFCLEVBQUU7SUFDRixNQUFNLE1BQU0sR0FBRyxJQUFBLG1CQUFTLEVBQUMsU0FBUyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUE7SUFFMUQsTUFBTSxZQUFZLEdBQXFCO1FBQ3JDLGtCQUFrQjtRQUNsQixHQUFJLE1BQU0sQ0FBQyxXQUFXLENBQUMsTUFBTSxDQUMzQixDQUFDLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQyxDQUFDLElBQUksS0FBSyxjQUFJLENBQUMsbUJBQW1CLENBQ2QsQ0FBQyxHQUFHLENBQUMsQ0FBQyxXQUFXLEVBQUUsRUFBRSxDQUFDLENBQUM7WUFDbkQsSUFBSSxFQUFFLFdBQVc7WUFDakIsSUFBSSxFQUFFLFdBQVcsQ0FBQyxJQUFJLENBQUMsS0FBSztZQUM1QixNQUFNLEVBQUUsV0FBVyxDQUFDLGFBQWEsQ0FBQyxJQUFJLENBQUMsS0FBSztZQUM1QyxVQUFVLEVBQUUsS0FBSztTQUNsQixDQUFDLENBQUM7UUFDSCxHQUFHLENBQUMsTUFBTSxDQUFDLGlCQUFpQixJQUFJLEVBQUUsQ0FBQztLQUNwQyxDQUFBO0lBRUQsTUFBTSxPQUFPLEdBQUcsSUFBSSxvQkFBVSxDQUFDLE1BQU0sRUFBRSxZQUFZLEVBQUUsTUFBTSxDQUFDLENBQUE7SUFDNUQsSUFBQSx5QkFBUSxFQUFDLE1BQU0sRUFBRSxFQUFFLEtBQUssRUFBRSxPQUFPLEVBQUUsQ0FBQyxDQUFBO0lBQ3BDLE9BQU87UUFDTCxPQUFPLEVBQUUsT0FBTyxDQUFDLFVBQVUsRUFBRTtRQUM3QixPQUFPLEVBQUUsT0FBTyxDQUFDLFVBQVU7S0FDNUIsQ0FBQTtBQUNILENBQUMsQ0FBQTtBQTFCWSxRQUFBLE1BQU0sVUEwQmxCO0FBRU0sTUFBTSxRQUFRLEdBQXlDLEtBQUssRUFDakUsT0FBc0IsRUFDdEIsVUFBZ0MsRUFDaEMsT0FBMkIsRUFDM0IsVUFBa0IsRUFDbEIsRUFBRTtJQUNGLElBQUksSUFBQSxjQUFPLEVBQUMsVUFBVSxDQUFDLEtBQUssS0FBSyxFQUFFLENBQUM7UUFDbEMsTUFBTSxJQUFJLEtBQUssQ0FBQyx5REFBeUQsQ0FBQyxDQUFBO0lBQzVFLENBQUM7QUFDSCxDQUFDLENBQUE7QUFUWSxRQUFBLFFBQVEsWUFTcEIifQ==