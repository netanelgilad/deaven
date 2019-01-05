import { ESFunction } from "../Function/Function";
import { TExecutionContext } from "../execution-context/ExecutionContext";
import { Type, Undefined } from "../types";

export const evalFn = ESFunction(function*(
  _self: Type,
  args: Type[],
  execContext: TExecutionContext
) {
  return [Undefined, execContext] as [typeof Undefined, TExecutionContext];
});
