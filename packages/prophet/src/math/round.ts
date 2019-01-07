import { Any, isESString, NotANumber, TESNumber } from "../types";
import { TExecutionContext } from "../execution-context/ExecutionContext";
import { unsafeCast } from "../unsafeGet";

export function* round(
  _self: any,
  args: [TESNumber, ...Array<Any>],
  execContext: TExecutionContext
) {
  if (!args[0] || isESString(args[0])) {
    return [NotANumber, execContext];
  } else {
    return [
      {
        number: Math.round(unsafeCast<number>(args[0].value))
      },
      execContext
    ];
  }
}
