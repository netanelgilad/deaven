import { Concatenation, NumberLiteral, Type } from "../types";
import { first } from "lodash";

export function substr(
  self: Concatenation,
  args: [NumberLiteral, NumberLiteral, ...Array<Type>]
) {
  return {
    string: first(self.parts).string.substr(args[0].number, args[1].number)
  };
}
