import { Type, GreaterThanEquals, NumberLiteral } from "./types";

export function plus(left: Type, right: Type) {
  return {
    parts: [left, right]
  };
}

export function greaterThanEquals(
  left: GreaterThanEquals,
  right: NumberLiteral
) {
  return left.gte > right.number;
}
