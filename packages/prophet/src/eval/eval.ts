import { ESFunction } from "../Function/Function";
import { TExecutionContext } from "../execution-context/ExecutionContext";
import { Any, Undefined } from "../types";
import { tuple } from "@deaven/tuple";
import { TESString } from "../string/String";
import { unsafeCast } from "../unsafeGet";
import { parse } from "@babel/parser";
import { evaluate } from "../evaluate";
import { isExpressionStatement } from "@babel/types";

export const evalFn = ESFunction(function*(
  _self: Any,
  args: Any[],
  execContext: TExecutionContext
) {
  const source = unsafeCast<string>(unsafeCast<TESString>(args[0]).value);
  const parsedSource = parse(source);
  const statements = parsedSource.program.body;

  let currentEvaluationResult = tuple(Undefined, execContext);
  for (const statement of statements.slice(0, statements.length - 1)) {
    currentEvaluationResult = yield evaluate(
      statement,
      currentEvaluationResult[1]
    );
  }

  const lastStatement = statements[statements.length - 1];

  if (isExpressionStatement(lastStatement)) {
    return evaluate(lastStatement.expression, currentEvaluationResult[1]);
  }

  return evaluate(lastStatement, currentEvaluationResult[1]);
});
