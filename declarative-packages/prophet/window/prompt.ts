import { ESString } from "../string/String";
import { TExecutionContext } from "../execution-context/ExecutionContext";
import { Any } from "../types";

export function* prompt(
  _sefl: Any,
  _args: Array<Any>,
  execContext: TExecutionContext
) {
  return [ESString(), execContext];
}
