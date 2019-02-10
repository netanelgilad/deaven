import { Any, TESNumber } from "../types";
import { first } from "lodash";
import { TESString, ESString } from "./String";
import { TExecutionContext } from "../execution-context/ExecutionContext";
import { unsafeCast } from "@deaven/unsafe-cast.macro";

export function* substr(
  self: TESString,
  args: [TESNumber, TESNumber, ...Array<Any>],
  execContext: TExecutionContext
) {
  return [
    ESString(
      ((first(self.value as Array<TESString>) as TESString)
        .value as string).substr(
        unsafeCast<number>(args[0].value),
        unsafeCast<number>(args[1].value)
      )
    ),
    execContext
  ];
}
