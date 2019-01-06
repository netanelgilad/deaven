import { ESFunction } from "../Function/Function";
import { TExecutionContext } from "../execution-context/ExecutionContext";
import { Any, Undefined } from "../types";
import { tuple } from "@deaven/tuple";
import { TESString } from "../string/String";
import { unsafeCast } from "../unsafeGet";
import { parse } from "@babel/parser";
import { evaluate } from "../evaluate";

export const evalFn = ESFunction(function*(
  _self: Any,
  args: Any[],
  execContext: TExecutionContext
) {
  const source = unsafeCast<string>(unsafeCast<TESString>(args[0]).value);
  const parsedSource = parse(source);
  const statements = parsedSource.program.body;

  return statements.reduce(
    ([, prevExecContext], statement) => evaluate(statement, prevExecContext),
    tuple(Undefined as Any, execContext)
  );
});
