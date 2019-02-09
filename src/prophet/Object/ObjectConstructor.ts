import { ESFunction } from "../Function/Function";
import { Any } from "../types";
import { tuple } from "@deaven/tuple";

export const ObjectConstructor = ESFunction(function*(
  _self: Any,
  args: Any[],
  execContext
) {
  return tuple(args[0], execContext);
});
