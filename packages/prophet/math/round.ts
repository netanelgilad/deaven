import { Type, isString, NotANumber, NumberLiteral } from "../types";

export function round(_self: any, args: [NumberLiteral, ...Array<Type>]) {
  if (!args[0] || isString(args[0])) {
    return NotANumber;
  } else {
    return {
      number: Math.round(args[0].number)
    };
  }
}
