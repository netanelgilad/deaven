import { Type, isStringLiteral, Concatenation, StringLiteral } from "../types";

export function split(
  self: Concatenation,
  args: [StringLiteral, ...Array<Type>]
) {
  return {
    parts: self.parts.map(part => {
      if (isStringLiteral(part)) {
        return {
          parts: part.string.split(args[0].string).map(string => ({
            string
          }))
        };
      }
      return {
        split: part
      };
    })
  };
}
