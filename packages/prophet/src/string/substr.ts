import { NumberLiteral, Type } from "../types";
import { first } from "lodash";
import { TString, String } from "./String";
import { TExecutionContext } from "../execution-context/ExecutionContext";

export function* substr(
  self: TString,
  args: [NumberLiteral, NumberLiteral, ...Array<Type>],
  execContext: TExecutionContext
) {
  return [
    String(
      ((first(self.value as Array<TString>) as TString).value as string).substr(
        args[0].number,
        args[1].number
      )
    ),
    execContext
  ];
}
