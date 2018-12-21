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
  ProgramResolver,
  AssignmentExpressionResolver,
  BlockStatementResolver,
  ReturnStatementResolver,
  ThisExpressionResolver,
  ObjectExpressionResolver,
  FunctionExpressionResolver
} from "./ASTResolvers";
import * as assert from "assert";
import {
  TExecutionContext,
  ExecutionContext
} from "./execution-context/ExecutionContext";
import { parseExpression, parse } from "@babel/parser";

const ASTResolvers = new Map<string, ASTResolver<any, any>>([
  ["StringLiteral", StringLiteralResolver],
  ["NumericLiteral", NumericLiteralResolver],
  ["Identifier", IdentifierResolver],
  ["MemberExpression", MemberExpressionResolver],
  ["CallExpression", CallExpressionResolver],
  ["BinaryExpression", BinaryExpressionResolver],
  ["File", FileResolver],
  ["Program", ProgramResolver],
  ["AssignmentExpression", AssignmentExpressionResolver],
  ["BlockStatement", BlockStatementResolver],
  ["ReturnStatement", ReturnStatementResolver],
  ["ThisExpression", ThisExpressionResolver],
  ["ObjectExpression", ObjectExpressionResolver],
  ["FunctionExpression", FunctionExpressionResolver]
]);

export function evaluate(
  ast: Node,
  execContext: TExecutionContext
): [Type, TExecutionContext] {
  const resolver = ASTResolvers.get(ast.type);
  assert(resolver, `Can't resolve type of ast type ${ast.type}`);
  return resolver!(ast, execContext || ExecutionContext({}));
}

export function evaluateCode(code: string, execContext: TExecutionContext) {
  return evaluate(parse(code), execContext);
}

export function evaluateCodeAsExpression(
  code: string,
  execContext: TExecutionContext
) {
  return evaluate(parseExpression(code), execContext);
}
