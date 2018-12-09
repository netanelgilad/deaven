import { Type } from "./types";
import { Node } from "@babel/types";
import {
  ASTResolver,
  IdentifierResolver,
  StringLiteralResolver,
  NumericLiteralResolver,
  MemberExpressionResolver,
  CallExpressionResolver,
  BinaryExpressionResolver,
  FileResolver,
  ProgramResolver
} from "./ASTResolvers";
import * as assert from "assert";
import {
  TExecutionContext,
  ExecutionContext
} from "./execution-context/ExecutionContext";

const ASTResolvers = new Map<string, ASTResolver<any, any>>([
  ["StringLiteral", StringLiteralResolver],
  ["NumericLiteral", NumericLiteralResolver],
  ["Identifier", IdentifierResolver],
  ["MemberExpression", MemberExpressionResolver],
  ["CallExpression", CallExpressionResolver],
  ["BinaryExpression", BinaryExpressionResolver],
  ["File", FileResolver],
  ["Program", ProgramResolver]
]);

export function getType(
  ast: Node,
  prevContext?: TExecutionContext
): Type | [Type, TExecutionContext] {
  const resolver = ASTResolvers.get(ast.type);
  assert(resolver, `Can't resolve type of ast type ${ast.type}`);
  return resolver!(ast, prevContext || ExecutionContext({}));
}
