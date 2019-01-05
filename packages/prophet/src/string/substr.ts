import { Any, NumberLiteral } from "../types";
import { first } from "lodash";
import { TESString, ESString } from "./String";
import { TExecutionContext } from "../execution-context/ExecutionContext";

export function* substr(
  self: TESString,
  args: [NumberLiteral, NumberLiteral, ...Array<Any>],
  execContext: TExecutionContext
) {
  return [
    ESString(
      ((first(self.value as Array<TESString>) as TESString)
        .value as string).substr(args[0].number, args[1].number)
    ),
    execContext
  ];
}
