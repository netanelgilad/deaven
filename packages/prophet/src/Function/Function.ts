import { TESString } from "../string/String";
import {
  Any,
  Undefined,
  FunctionImplementation,
  FunctionBinding,
  isReturnValue,
  EvaluationResult
} from "../types";
import { parse } from "@babel/parser";
import {
  ExpressionStatement,
  ArrowFunctionExpression,
  BlockStatement,
  LVal,
  Identifier,
  Statement
} from "@babel/types";
import {
  TExecutionContext,
  setVariableInScope
} from "../execution-context/ExecutionContext";
import { evaluate } from "../evaluate";
import { unsafeCast } from "../unsafeGet";
import { ESObject } from "../Object";
import { tuple } from "@deaven/tuple";

export function ESFunction(implementation: FunctionImplementation) {
  return {
    properties: {
      prototype: ESObject()
    },
    function: {
      implementation
    }
  };
}

export const FunctionConstructor = ESFunction(function*(
  _self: Any,
  args: Any[],
  execContext: TExecutionContext
) {
  const blockStatement = ((parse(
    `() => {${unsafeCast<TESString>(args[0]).value as string}}`
  ).program.body[0] as ExpressionStatement)
    .expression as ArrowFunctionExpression).body as BlockStatement;
  return [createFunction(blockStatement.body, []), execContext] as [
    FunctionBinding,
    TExecutionContext
  ];
});

export function createFunction(statements: Statement[], params: Array<LVal>) {
  return {
    properties: {
      prototype: ESObject()
    },
    function: {
      implementation: function*(
        _self: Any,
        args: Array<Any>,
        execContext: TExecutionContext
      ) {
        const atferParametersInScopeExecContext = params.reduce(
          (prevContext, parameter, index) =>
            setVariableInScope(
              prevContext,
              unsafeCast<Identifier>(parameter).name,
              args[index]
            ),
          execContext
        );

        let currentEvaluationResult = tuple(
          Undefined,
          atferParametersInScopeExecContext
        ) as [EvaluationResult, TExecutionContext];

        for (const statement of statements) {
          currentEvaluationResult = evaluate(
            statement,
            currentEvaluationResult[1]
          );
          if (isReturnValue(currentEvaluationResult[0])) {
            return tuple(
              currentEvaluationResult[0].value,
              currentEvaluationResult[1]
            );
          } else {
            yield currentEvaluationResult;
          }
        }

        return tuple(Undefined, currentEvaluationResult[1]);
      }
    }
  };
}
