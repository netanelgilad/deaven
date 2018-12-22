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
  ThisExpression,
  ObjectExpression,
  ObjectMember,
  FunctionExpression,
  ObjectMethod
} from "@babel/types";
import { String, TString } from "./string/String";
import {
  WithProperties,
  isFunction,
  Type,
  Undefined,
  GreaterThanEquals,
  NumberLiteral,
  FunctionBinding
} from "./types";
import { evaluate } from "./evaluate";
import { greaterThanEquals, plus } from "./operators";
import { getExecutionContext } from "./execution-context/getExecutionContext";
import {
  TExecutionContext,
  setCurrentThisValue,
  setVariableInScope
} from "./execution-context/ExecutionContext";
import { createFunction } from "./Function/Function";
import { isNull } from "util";
import { unsafeCast } from "./unsafeGet";
import { TESObject, ESObject } from "./Object";

export type ASTResolver<TAST extends Node, T extends Type> = (
  ast: TAST,
  prevContext: TExecutionContext
) => [T, TExecutionContext];

export const noExecutionContextResolver = <TAST extends Node, T extends Type>(
  fn: (ast: TAST, execContext: TExecutionContext) => T
) => (ast: TAST, execContext: TExecutionContext) =>
  [fn(ast, execContext), execContext] as [T, TExecutionContext];

export const IdentifierResolver: ASTResolver<
  Identifier,
  Type
> = noExecutionContextResolver((ast, execContext) => {
  const resolvedFromScope = execContext.value.scope[ast.name];
  return (
    resolvedFromScope ||
    execContext.value.global.properties[ast.name] ||
    Undefined
  );
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
        parameters: [],
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
    unsafeCast<FunctionBinding>(calleeType).self ||
      afterArgsExecContext.value.global
  );

  const atferParametersInScopeExecContext = unsafeCast<FunctionBinding>(
    calleeType
  ).parameters.reduce(
    (prevContext, parameter, index) =>
      setVariableInScope(prevContext, parameter, argsTypes[index]),
    afterArgsExecContext
  );

  return unsafeCast<FunctionBinding>(calleeType).function.implementation(
    unsafeCast<FunctionBinding>(calleeType).self ||
      atferParametersInScopeExecContext.value.global,
    argsTypes,
    atferParametersInScopeExecContext
  );
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
      const [statementType, newExecContext] = evaluate(statement, execContext);
      return [statementType, newExecContext] as [Type, TExecutionContext];
    },
    [Undefined, execContext] as [Type, TExecutionContext]
  );
};

export const AssignmentExpressionResolver: ASTResolver<
  AssignmentExpression,
  Type
> = (ast, execContext) => {
  if (ast.left.type === "MemberExpression") {
    const [objectType, afterLeftExecContext] = evaluate(
      ast.left.object,
      execContext
    );
    const [rightType, afterRightExecContext] = evaluate(
      ast.right,
      afterLeftExecContext
    );
    unsafeCast<WithProperties>(objectType).properties[
      ast.left.property.name
    ] = rightType;
    return [rightType, afterRightExecContext];
  } else {
    const [rightType, afterRightExecContext] = evaluate(ast.right, execContext);
    return [
      rightType,
      setVariableInScope(
        afterRightExecContext,
        unsafeCast<Identifier>(ast.left).name,
        rightType
      )
    ];
  }
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
  return [execContext.value.thisValue, execContext];
};

export const ObjectExpressionResolver: ASTResolver<
  ObjectExpression,
  TESObject
> = (ast, execContext) => {
  const [objValue, afterPropertiesExecContext] = ast.properties.reduce(
    ([obj, execContext], property) => {
      let propValueType, afterPropExecContext;
      if (property.type === "ObjectProperty") {
        if (property.shorthand) {
          [propValueType, afterPropExecContext] = evaluate(
            property.key,
            execContext
          );
        } else {
          [propValueType, afterPropExecContext] = evaluate(
            property.value,
            execContext
          );
        }
      } else {
        propValueType = createFunction(
          unsafeCast<ObjectMethod>(property).body,
          unsafeCast<ObjectMethod>(property).params
        );
        afterPropExecContext = execContext;
      }
      return [
        {
          ...obj,
          [unsafeCast<ObjectMember>(property).key.name]: propValueType
        },
        afterPropExecContext
      ] as [{ [key: string]: Type }, TExecutionContext];
    },
    [{}, execContext] as [{ [key: string]: Type }, TExecutionContext]
  );
  return [ESObject(objValue), afterPropertiesExecContext];
};

export const FunctionExpressionResolver: ASTResolver<
  FunctionExpression,
  FunctionBinding
> = (ast, execContext) => {
  return [createFunction(ast.body, ast.params), execContext];
};
