import { TODOTYPE } from "./types";
import { getLengthOfType } from "./getLengthOfType";
import { round } from "./math/round";
import { split } from "./string/split";
import { plus, greaterThanEquals } from "./operators";
import { reverse } from "./array/reverse";
import { join } from "./array/join";
import { substr } from "./string/substr";
import { prompt } from "./window/prompt";

export function getType(ast): any {
  if (ast.type === "Identifier" && ast.name === "Math") {
    return TODOTYPE;
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

  if (ast.type === "Identifier" && ast.name === "prompt") {
    return {
      implementation: prompt
    };
  }

  if (ast.type === "CallExpression") {
    if (
      ast.callee.type === "MemberExpression" &&
      ast.callee.object.type === "Identifier" &&
      ast.callee.object.name === "Math" &&
      ast.callee.property.type === "Identifier" &&
      ast.callee.property.name === "round"
    ) {
      return round(getType(ast.callee.object), ast.arguments.map(getType));
    }

    if (
      ast.callee.type === "MemberExpression" &&
      ast.callee.property.type === "Identifier" &&
      ast.callee.property.name === "split"
    ) {
      return split(getType(ast.callee.object), ast.arguments.map(getType));
    }
    ``;

    if (
      ast.callee.type === "MemberExpression" &&
      ast.callee.property.type === "Identifier" &&
      ast.callee.property.name === "reverse"
    ) {
      return reverse(getType(ast.callee.object));
    }

    if (
      ast.callee.type === "MemberExpression" &&
      ast.callee.property.type === "Identifier" &&
      ast.callee.property.name === "join"
    ) {
      return join(getType(ast.callee.object), ast.arguments.map(getType));
    }

    if (
      ast.callee.type === "MemberExpression" &&
      ast.callee.property.type === "Identifier" &&
      ast.callee.property.name === "substr"
    ) {
      return substr(getType(ast.callee.object), ast.arguments.map(getType));
    }

    return getType(ast.callee).implementation(
      undefined,
      ast.arguments.map(getType)
    );
  }

  if (
    ast.type === "MemberExpression" &&
    ast.property.type === "Identifier" &&
    ast.property.name === "length"
  ) {
    return getLengthOfType(getType(ast.object));
  }

  if (ast.type === "BinaryExpression") {
    if (ast.operator === ">") {
      return greaterThanEquals(getType(ast.left), getType(ast.right));
    } else {
      return plus(getType(ast.left), getType(ast.right));
    }
  }

  throw new Error("Failed to getType of ast " + ast.type);
}
