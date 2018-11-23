import { isNumberLiteral, Number, isStringLiteral, String } from "./types";

export function doTypesMatch(first, second): boolean {
  return (isNumberLiteral(first) && second === Number) ||
    (isStringLiteral(first) && second === String);
}
