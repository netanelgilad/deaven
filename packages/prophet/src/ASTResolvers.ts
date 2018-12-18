import {
  Node,
  Identifier,
  StringLiteral,
  NumericLiteral,
  MemberExpression,
  CallExpression,
  BinaryExpression,
  File,
  Program,
  AssignmentExpression,
  BlockStatement,
  ReturnStatement,
  ThisExpression
} from "@babel/types";
import { String, TString } from "./string/String";
import {
  TODOTYPE,
  WithProperties,
  isFunction,
  Type,
  Undefined,
  GreaterThanEquals,
  NumberLiteral
} from "./types";
import { prompt } from "./window/prompt";
import { Math } from "./math/Math";
import { evaluate } from "./evaluate";
import { greaterThanEquals, plus } from "./operators";
import { getExecutionContext } from "./execution-context/getExecutionContext";
import {
  TExecutionContext,
  setCurrentThisValue
} from "./execution-context/ExecutionContext";
import { resolveReference } from "./reference/resolveReference";
import { FunctionConstructor } from "./Function/Function";
import { isNull } from "util";
import { unsafeGet, unsafeCast } from "./unsafeGet";

export type ASTResolver<TAST extends Node, T extends Type> = (
  ast: TAST,
  prevContext: TExecutionContext
) => [T, TExecutionContext];

export const noExecutionContextResolver = <TAST extends Node, T extends Type>(
  fn: (ast: TAST) => T
) => (ast: TAST, execContext: TExecutionContext) =>
  [fn(ast), execContext] as [T, TExecutionContext];

export const IdentifierResolver: ASTResolver<
  Identifier,
  Type
> = noExecutionContextResolver(ast => {
  if (ast.name === "prompt") {
    return {
      self: TODOTYPE,
      function: {
        implementation: prompt
      }
    };
  } else if (ast.name === "Math") {
    return Math;
  } else {
    return FunctionConstructor;
  }
});

export const StringLiteralResolver: ASTResolver<
  StringLiteral,
  TString
> = noExecutionContextResolver(ast => String(ast.value));

export const NumericLiteralResolver: ASTResolver<
  NumericLiteral,
  { number: number }
> = noExecutionContextResolver(ast => ({
  number: ast.value
}));

export const MemberExpressionResolver: ASTResolver<MemberExpression, Type> = (
  ast,
  execContext
) => {
  const [objectType, newExecContext] = evaluate(ast.object, execContext);
  const propertyType = (objectType as WithProperties).properties[
    ast.property.name
  ];
  if (isFunction(propertyType)) {
    return [
      {
        self: objectType,
        function: propertyType
      },
      newExecContext
    ];
  } else {
    return [propertyType, newExecContext];
  }
};

export const CallExpressionResolver: ASTResolver<CallExpression, Type> = (
  ast,
  execContext
) => {
  let [calleeType, newExecContext] = evaluate(ast.callee, execContext);

  let [argsTypes, afterArgsExecContext] = ast.arguments.reduce(
    ([args, execContext], argAST) => {
      const [argType, newExecContext] = evaluate(argAST, execContext);
      return [[...args, argType], newExecContext] as [
        Array<Type>,
        TExecutionContext
      ];
    },
    [[], newExecContext] as [Array<Type>, TExecutionContext]
  );

  afterArgsExecContext = setCurrentThisValue(
    afterArgsExecContext,
    unsafeGet(calleeType, "self") || afterArgsExecContext.value.global
  );

  return [
    unsafeGet(calleeType, "function").implementation(
      unsafeGet(calleeType, "self"),
      argsTypes,
      afterArgsExecContext
    ),
    afterArgsExecContext
  ];
};

export const BinaryExpressionResolver: ASTResolver<
  BinaryExpression,
  boolean | TString
> = (ast, execContext) => {
  const [leftType, leftExecContext] = evaluate(ast.left, execContext);
  const [rightType, rightExecContext] = evaluate(ast.right, leftExecContext);
  if (ast.operator === ">") {
    return [
      greaterThanEquals(
        unsafeCast<GreaterThanEquals>(leftType),
        unsafeCast<NumberLiteral>(rightType)
      ),
      rightExecContext
    ];
  } else {
    return [plus(leftType, rightType), rightExecContext];
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
  return [Undefined, ast.body.reduce(getExecutionContext, execContext)];
};

export const BlockStatementResolver: ASTResolver<BlockStatement, Type> = (
  ast,
  execContext
) => {
  return ast.body.reduce(
    ([, execContext], statement) => {
      const [, newExecContext] = evaluate(statement, execContext);
      return [Undefined, newExecContext] as [Type, TExecutionContext];
    },
    [Undefined, execContext] as [Type, TExecutionContext]
  );
};

export const AssignmentExpressionResolver: ASTResolver<
  AssignmentExpression,
  Type
> = (ast, execContext) => {
  resolveReference(ast.left as MemberExpression, execContext);
  return [Undefined, execContext];
};

export const ReturnStatementResolver: ASTResolver<ReturnStatement, Type> = (
  ast,
  execContext
) => {
  if (isNull(ast.argument)) {
    return [Undefined, execContext];
  }
  return evaluate(ast.argument, execContext);
};

export const ThisExpressionResolver: ASTResolver<ThisExpression, Type> = (
  _ast,
  execContext
) => {
  return execContext.value.thisValue;
};
