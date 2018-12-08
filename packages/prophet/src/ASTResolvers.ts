import {
  Node,
  Identifier,
  StringLiteral,
  NumericLiteral,
  MemberExpression,
  CallExpression,
  BinaryExpression
} from "@babel/types";
import { String, TString } from "./string/String";
import {
  TODOTYPE,
  WithProperties,
  isFunction,
  Type,
  FunctionBinding,
  GreaterThanEquals,
  NumberLiteral
} from "./types";
import { prompt } from "./window/prompt";
import { Math } from "./math/Math";
import { getType } from "./getType";
import { greaterThanEquals, plus } from "./operators";

export type ASTResolver<TAST extends Node, T extends Type> = (ast: TAST) => T;

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

export const MemberExpressionResolver: ASTResolver<
  MemberExpression,
  Type
> = ast => {
  const objectType = getType(ast.object);
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

export const CallExpressionResolver: ASTResolver<
  CallExpression,
  Type
> = ast => {
  const calleeType = getType(ast.callee) as FunctionBinding;
  return calleeType.function.implementation(
    calleeType.self,
    ast.arguments.map(getType)
  );
};

export const BinaryExpressionResolver: ASTResolver<
  BinaryExpression,
  boolean | TString
> = ast => {
  if (ast.operator === ">") {
    return greaterThanEquals(
      getType(ast.left) as GreaterThanEquals,
      getType(ast.right) as NumberLiteral
    );
  } else {
    return plus(getType(ast.left), getType(ast.right));
  }
};
