import { Type, GreaterThanEquals, NumberLiteral, isString } from "./types";
import { String, TString } from "./string/String";
import { unsafeCast } from "./unsafeGet";

export type BinaryOperatorResolver = (left: Type, right: Type) => Type;

export function plus(left: Type, right: Type) {
  if (isString(left) && typeof left.value === "string") {
    if (isString(right)) {
      return String(left.value + right.value);
    }
    return String(left.value + "true");
  }
  return String([left as TString, right as TString]);
}

export function greaterThan(left: Type, right: Type) {
  return (
    unsafeCast<GreaterThanEquals>(left).gte >
    unsafeCast<NumberLiteral>(right).number
  );
}

export const BinaryOperatorResolvers = new Map<string, BinaryOperatorResolver>([
  [">", greaterThan],
  ["+", plus]
]);
