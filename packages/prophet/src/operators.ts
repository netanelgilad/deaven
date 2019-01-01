import { Type, GreaterThanEquals, NumberLiteral, isString } from "./types";
import { String, TString } from "./string/String";

export function plus(left: Type, right: Type) {
  if (isString(left) && typeof left.value === "string") {
    if (isString(right)) {
      return String(left.value + right.value);
    }
    return String(left.value + "true");
  }
  return String([left as TString, right as TString]);
}

export function greaterThanEquals(
  left: GreaterThanEquals,
  right: NumberLiteral
) {
  return left.gte > right.number;
}
