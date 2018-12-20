import { String } from "../string/String";
import { TExecutionContext } from "../execution-context/ExecutionContext";
import { Type } from "../types";

export function prompt(
  _sefl: Type,
  _args: Array<Type>,
  execContext: TExecutionContext
) {
  return [String(), execContext];
}
