import { ESFunction } from "../Function/Function";
import { TExecutionContext } from "../execution-context/ExecutionContext";
import { Any, Undefined } from "../types";
import { tuple } from "@deaven/tuple";

export const evalFn = ESFunction(function*(
  _self: Any,
  _args: Any[],
  execContext: TExecutionContext
) {
  return tuple(Undefined, execContext);
});
