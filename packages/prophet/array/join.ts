import { Concatenation, Type, isStringLiteral, StringLiteral } from "../types";
import { last } from "lodash";

export function join(
  self: Concatenation,
  args: [StringLiteral, ...Array<Type>]
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
          lastPart.string = lastPart.string + args[0].string + part.string;
          return result;
        } else {
          return reduceConcatenation(lastPart as Concatenation);
        }
      }
    }, undefined);
  };

  return reduceConcatenation(self);
}
