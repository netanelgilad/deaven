import { ESFunction } from "../Function/Function";
import { Any } from "../types";
import { TExecutionContext } from "../execution-context/ExecutionContext";

export const NumberConstructor = ESFunction(function*(
  _self: Any,
  args: Any[],
  execContext
) {
  return [args[0], execContext] as [Any, TExecutionContext];
});
