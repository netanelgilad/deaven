import { Type, GreaterThanEquals, NumberLiteral } from "./types";
import { String, TString } from "./string/String";

export function plus(left: Type, right: Type) {
  return String([left as TString, right as TString]);
}

export function greaterThanEquals(
  left: GreaterThanEquals,
  right: NumberLiteral
) {
  return left.gte > right.number;
}
