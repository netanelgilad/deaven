import { isArray, Any } from "../types";
import { TArray, Array } from "./Array";
import { TExecutionContext } from "../execution-context/ExecutionContext";

export function* reverse(
  self: TArray<any>,
  _args: Array<Any>,
  execContext: TExecutionContext
) {
  return [
    Array(
      (self.value as Array<TArray<any>>).reverse().map(part => {
        if (isArray(part) && part.value) {
          return Array(part.value.reverse(), part.concrete);
        }
        return part;
      }),
      self.concrete
    ),
    execContext
  ];
}
