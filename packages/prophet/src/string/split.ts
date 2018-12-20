import { Type } from "../types";
import { TString, String } from "./String";
import { Array } from "../array/Array";
import { TExecutionContext } from "../execution-context/ExecutionContext";

export function split(
  self: TString,
  args: [TString, ...Array<Type>],
  execContext: TExecutionContext
) {
  return [
    Array(
      (self.value as Array<TString>).map(part => {
        if (part.value) {
          return Array(
            (part.value as string)
              .split(args[0].value as string)
              .map(string => String(string)),
            true
          );
        }
        return Array();
      })
    ),
    execContext
  ];
}
