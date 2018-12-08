import { Type } from "./types";
import { Node } from "@babel/types";
import {
  ASTResolver,
  IdentifierResolver,
  StringLiteralResolver,
  NumericLiteralResolver,
  MemberExpressionResolver,
  CallExpressionResolver,
  BinaryExpressionResolver
} from "./ASTResolvers";

const ASTResolvers = new Map<string, ASTResolver<any, any>>([
  ["StringLiteral", StringLiteralResolver],
  ["NumericLiteral", NumericLiteralResolver],
  ["Identifier", IdentifierResolver],
  ["MemberExpression", MemberExpressionResolver],
  ["CallExpression", CallExpressionResolver],
  ["BinaryExpression", BinaryExpressionResolver]
]);

export function getType(ast: Node): Type {
  const resolver = ASTResolvers.get(ast.type);
  return resolver!(ast);
}
