import { ESFunction } from "../Function/Function";
import { TExecutionContext } from "../execution-context/ExecutionContext";
import { Any } from "../types";
import { ESString, TESString } from "../string/String";

export const evalFn = ESFunction(function*(
  _self: Any,
  args: Any[],
  execContext: TExecutionContext
) {
  return [ESString(""), execContext] as [TESString, TExecutionContext];
});
