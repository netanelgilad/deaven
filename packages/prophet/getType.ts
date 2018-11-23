import {
  String,
  NotANumber,
  isNumberLiteral,
  isStringLiteral,
  isString,
  isConcatenation,
  Concatenation,
  isGreaterThanEquals,
  isSplit
} from "./types";
import { last, initial, first } from "lodash";

export function getType(ast): any {
  if (
    ast.type === "CallExpression" &&
    ast.callee.type === "MemberExpression" &&
    ast.callee.object.type === "Identifier" &&
    ast.callee.object.name === "Math" &&
    ast.callee.property.type === "Identifier" &&
    ast.callee.property.name === "round"
  ) {
    const firstArugment = ast.arguments[0];
    if (!firstArugment || isString(getType(firstArugment))) {
      return NotANumber;
    } else if (isNumberLiteral(getType(firstArugment))) {
      return {
        number: Math.round(firstArugment.value)
      };
    }
  }

  if (ast.type === "StringLiteral") {
    return {
      string: ast.value
    };
  }
  if (ast.type === "NumericLiteral") {
    return {
      number: ast.value
    };
  }
  if (
    ast.type === "CallExpression" &&
    ast.callee.type === "Identifier" &&
    ast.callee.name === "prompt" &&
    ast.arguments.length === 0
  ) {
    return String;
  }
  if (
    ast.type === "BinaryExpression" &&
    ast.operator === "+" &&
    isStringLiteral(getType(ast.right)) &&
    isString(getType(ast.left))
  ) {
    return {
      parts: [getType(ast.left), getType(ast.right)]
    };
  }

  if (
    ast.type === "CallExpression" &&
    ast.arguments.length === 1 &&
    isStringLiteral(getType(ast.arguments[0])) &&
    ast.callee.type === "MemberExpression" &&
    isConcatenation(getType(ast.callee.object)) &&
    ast.callee.property.type === "Identifier" &&
    ast.callee.property.name === "split"
  ) {
    return {
      parts: getType(ast.callee.object).parts.map(part => {
        if (isStringLiteral(part)) {
          return {
            parts: part.string
              .split(getType(ast.arguments[0]).string)
              .map(string => ({
                string
              }))
          };
        }
        if (isString(part)) {
          return {
            split: part
          };
        }
      })
    };
  }

  if (
    ast.type === "CallExpression" &&
    ast.arguments.length === 0 &&
    ast.callee.type === "MemberExpression" &&
    ast.callee.property.type === "Identifier" &&
    ast.callee.property.name === "reverse" &&
    isConcatenation(getType(ast.callee.object))
  ) {
    return {
      parts: getType(ast.callee.object)
        .parts.reverse()
        .map(part => {
          if (isStringLiteral(part)) {
            return {
              string: part.string
                .split("")
                .reverse()
                .join("")
            };
          }
          if (isConcatenation(part)) {
            return {
              parts: part.parts.reverse()
            };
          }
          return {
            reverse: part
          };
        })
    };
  }

  if (
    ast.type === "CallExpression" &&
    ast.arguments.length === 1 &&
    isStringLiteral(getType(ast.arguments[0])) &&
    ast.callee.type === "MemberExpression" &&
    isConcatenation(getType(ast.callee.object)) &&
    ast.callee.property.type === "Identifier" &&
    ast.callee.property.name === "join"
  ) {
    const reduceConcatenation = (arg: Concatenation) => {
      return arg.parts.reduce((result, part) => {
        if (!result) {
          return {
            parts: [part]
          };
        } else {
          const lastPart = last(result.parts);
          if (isStringLiteral(lastPart) && isStringLiteral(part)) {
            lastPart.string =
              lastPart.string + getType(ast.arguments[0]).string + part.string;
            return result;
          } else if (isStringLiteral(lastPart)) {
            return {
              parts: [
                ...initial(result.parts),
                { string: lastPart.string + getType(ast.arguments[0]).string },
                part
              ]
            };
          } else if (isConcatenation(lastPart)) {
            return reduceConcatenation(lastPart);
          } else {
            return {
              parts: [...result.parts, part]
            };
          }
        }
      }, undefined);
    };

    return reduceConcatenation(getType(ast.callee.object));
  }

  if (
    ast.type === "CallExpression" &&
    ast.callee.type === "MemberExpression" &&
    isConcatenation(getType(ast.callee.object)) &&
    ast.arguments.length === 2 &&
    ast.callee.property.type === "Identifier" &&
    ast.callee.property.name === "substr" &&
    isNumberLiteral(getType(ast.arguments[0])) &&
    isNumberLiteral(getType(ast.arguments[1]))
  ) {
    return {
      string: first(getType(ast.callee.object).parts).string.substr(
        getType(ast.arguments[0]).number,
        getType(ast.arguments[1]).number
      )
    };
  }

  if (
    ast.type === "MemberExpression" &&
    ast.property.type === "Identifier" &&
    ast.property.name === "length"
  ) {
    const getLengthOfType = type => {
      if (isConcatenation(type)) {
        return type.parts.reduce(
          (result, part) => {
            const partLength = getLengthOfType(part);
            if (isNumberLiteral(partLength) && isNumberLiteral(result)) {
              return {
                number: partLength.number + result.number
              };
            } else if (
              isNumberLiteral(partLength) &&
              isGreaterThanEquals(result)
            ) {
              return {
                gte: partLength.number + result.gte
              };
            } else if (
              isNumberLiteral(result) &&
              isGreaterThanEquals(partLength)
            ) {
              return {
                gte: partLength.gte + result.number
              };
            }
          },
          { number: 0 }
        );
      } else if (isStringLiteral(type)) {
        return { number: type.string.length };
      } else if (isString(type)) {
        return {
          gte: 0
        };
      } else if (isSplit(type)) {
        return getLengthOfType(type.split);
      }
    };

    return getLengthOfType(getType(ast.object));
  }

  if (ast.type === "BinaryExpression" && ast.operator === ">") {
    const leftType = getType(ast.left);
    const rightType = getType(ast.right);
    if (isGreaterThanEquals(leftType) && isNumberLiteral(rightType)) {
      return leftType.gte > rightType.number;
    }
  }
}
