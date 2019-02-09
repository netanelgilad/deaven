import { ESFunction } from "../Function/Function";
import { TExecutionContext } from "../execution-context/ExecutionContext";
import { Any, WithProperties, Undefined } from "../types";
import { unsafeCast } from "@deaven/unsafe-cast";
import { tuple } from "@deaven/tuple";

export const SyntaxErrorConstructor = ESFunction(function*(
  self: Any,
  args: Any[],
  execContext: TExecutionContext
) {
  unsafeCast<WithProperties>(self).properties.message = args[0];
  return tuple(Undefined, execContext);
});

// @ts-ignore
SyntaxErrorConstructor.properties.prototype.properties.toString = ESFunction(
  function*(self: Any, _args: Any[], execContext: TExecutionContext) {
    return tuple(
      unsafeCast<WithProperties>(self).properties.message,
      execContext
    );
  }
);
