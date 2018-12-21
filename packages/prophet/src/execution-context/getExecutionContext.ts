import { Statement } from "@babel/types";
import { TExecutionContext } from "./ExecutionContext";
import {
  StatementResolver,
  ExpressionStatementResolver,
  VariableDeclarationResolver
} from "./StatementResolvers";
import assert = require("assert");

const StatementResolvers = new Map<string, StatementResolver<any>>([
  ["ExpressionStatement", ExpressionStatementResolver],
  ["VariableDeclaration", VariableDeclarationResolver]
]);

export function getExecutionContext(
  prevContext: TExecutionContext,
  statement: Statement
) {
  const resolver = StatementResolvers.get(statement.type);
  assert(resolver, `Can't resolve type of statement type ${statement.type}`);
  return resolver!(prevContext, statement);
}
