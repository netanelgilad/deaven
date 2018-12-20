import { Type, isString, NotANumber, NumberLiteral } from "../types";
import { TExecutionContext } from "../execution-context/ExecutionContext";

export function round(
  _self: any,
  args: [NumberLiteral, ...Array<Type>],
  execContext: TExecutionContext
) {
  if (!args[0] || isString(args[0])) {
    return [NotANumber, execContext];
  } else {
    return [
      {
        number: Math.round(args[0].number)
      },
      execContext
    ];
  }
}
