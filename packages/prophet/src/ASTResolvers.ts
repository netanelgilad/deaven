import {
  Node,
  Identifier,
  StringLiteral,
  NumericLiteral,
  MemberExpression,
  CallExpression,
  BinaryExpression,
  File,
  Program
} from "@babel/types";
import { String, TString } from "./string/String";
import {
  TODOTYPE,
  WithProperties,
  isFunction,
  Type,
  FunctionBinding,
  GreaterThanEquals,
  NumberLiteral,
  Undefined
} from "./types";
import { prompt } from "./window/prompt";
import { Math } from "./math/Math";
import { getType } from "./getType";
import { greaterThanEquals, plus } from "./operators";
import { getExecutionContext } from "./execution-context/getExecutionContext";
import { TExecutionContext } from "./execution-context/ExecutionContext";

export type ASTResolver<TAST extends Node, T extends Type> = (
  ast: TAST,
  prevContext: TExecutionContext
) => T | [T, TExecutionContext];

export const IdentifierResolver: ASTResolver<Identifier, Type> = ast => {
  if (ast.name === "prompt") {
    return {
      self: TODOTYPE,
      function: {
        implementation: prompt
      }
    };
  } else {
    return Math;
  }
};
export const StringLiteralResolver: ASTResolver<StringLiteral, TString> = ast =>
  String(ast.value);

export const NumericLiteralResolver: ASTResolver<
  NumericLiteral,
  { number: number }
> = ast => ({
  number: ast.value
});

export const MemberExpressionResolver: ASTResolver<MemberExpression, Type> = (
  ast,
  execContext
) => {
  const objectType = getType(ast.object, execContext);
  const propertyType = (objectType as WithProperties).properties[
    ast.property.name
  ];
  if (isFunction(propertyType)) {
    return {
      self: objectType,
      function: propertyType
    };
  } else {
    return propertyType;
  }
};

export const CallExpressionResolver: ASTResolver<CallExpression, Type> = (
  ast,
  execContext
) => {
  const calleeType = getType(ast.callee, execContext) as FunctionBinding;
  return calleeType.function.implementation(
    calleeType.self,
    ast.arguments.map(arg => getType(arg, execContext))
  );
};

export const BinaryExpressionResolver: ASTResolver<
  BinaryExpression,
  boolean | TString
> = (ast, execContext) => {
  if (ast.operator === ">") {
    return greaterThanEquals(
      getType(ast.left, execContext) as GreaterThanEquals,
      getType(ast.right, execContext) as NumberLiteral
    );
  } else {
    return plus(
      getType(ast.left, execContext),
      getType(ast.right, execContext)
    );
  }
};

export const FileResolver: ASTResolver<File, typeof Undefined> = (
  ast,
  execContext
) => {
  return ProgramResolver(ast.program, execContext);
};

export const ProgramResolver: ASTResolver<Program, typeof Undefined> = (
  ast,
  execContext
) => {
  return [, ast.body.reduce(getExecutionContext, execContext)];
};
