import { Any } from "../types";
import { TESString, ESString } from "./String";
import { Array } from "../array/Array";
import { TExecutionContext } from "../execution-context/ExecutionContext";

export function* split(
  self: TESString,
  args: [TESString, ...Array<Any>],
  execContext: TExecutionContext
) {
  return [
    Array(
      (self.value as Array<TESString>).map(part => {
        if (part.value) {
          return Array(
            (part.value as string)
              .split(args[0].value as string)
              .map(string => ESString(string)),
            true
          );
        }
        return Array();
      })
    ),
    execContext
  ];
}
