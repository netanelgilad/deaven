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

const ASTResolvers = new Map<string, (ast: AST) => Type>([
  ["StringLiteral", ast => String(ast.value)],
  [
    "NumericLiteral",
    ast => ({
      number: ast.value
    })
  ],
  [
    "Identifier",
    ast => {
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
  ],
  [
    "MemberExpression",
    ast => {
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
  ],
  [
    "CallExpression",
    ast => {
      const calleeType = getType(ast.callee) as FunctionBinding;
      return calleeType.function.implementation(
        calleeType.self,
        ast.arguments.map(getType)
      );
    }
  ],
  [
    "BinaryExpression",
    ast => {
      if (ast.operator === ">") {
        return greaterThanEquals(
          getType(ast.left) as GreaterThanEquals,
          getType(ast.right) as NumberLiteral
        );
      } else {
        return plus(getType(ast.left), getType(ast.right));
      }
    }
  ]
]);

export function getType(ast: AST): Type {
  const resolver = ASTResolvers.get(ast.type);
  if (!resolver) {
    throw new Error("Failed to getType of ast " + ast.type);
  }

  return resolver(ast);
}
