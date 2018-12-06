import {
  TODOTYPE,
  isFunction,
  Type,
  WithProperties,
  FunctionBinding,
  GreaterThanEquals,
  NumberLiteral
} from "./types";
import { plus, greaterThanEquals } from "./operators";
import { prompt } from "./window/prompt";
import { Math } from "./math/Math";
import { String } from "./string/String";
import { AST } from "@babel/parser";

export function getType(ast: AST): Type {
  if (ast.type === "StringLiteral") {
    return String(ast.value);
  }
  if (ast.type === "NumericLiteral") {
    return {
      number: ast.value
    };
  }

  if (ast.type === "Identifier") {
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
  }

  if (ast.type === "MemberExpression") {
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
  }

  if (ast.type === "CallExpression") {
    const calleeType = getType(ast.callee) as FunctionBinding;
    return calleeType.function.implementation(
      calleeType.self,
      ast.arguments.map(getType)
    );
  }

  if (ast.type === "BinaryExpression") {
    if (ast.operator === ">") {
      return greaterThanEquals(
        getType(ast.left) as GreaterThanEquals,
        getType(ast.right) as NumberLiteral
      );
    } else {
      return plus(getType(ast.left), getType(ast.right));
    }
  }

  throw new Error("Failed to getType of ast " + ast.type);
}
