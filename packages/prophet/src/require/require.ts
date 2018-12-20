import { TExecutionContext } from "../execution-context/ExecutionContext";
import { Undefined, Type } from "../types";

export const requireFunction = {
  function: {
    implementation: (
      _self: Type,
      _args: Array<Type>,
      exeContext: TExecutionContext
    ) => [Undefined, exeContext]
  }
};
