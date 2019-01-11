import { TESString } from "../string/String";
import {
  Any,
  Undefined,
  FunctionImplementation,
  FunctionBinding,
  isReturnValue,
  EvaluationResult
} from "../types";
import {
  TExecutionContext,
  setVariableInScope
} from "../execution-context/ExecutionContext";
import { evaluate } from "../evaluate";
import { unsafeCast } from "../unsafeGet";
import { ESObject } from "../Object";
import { tuple } from "@deaven/tuple";
import { parseECMACompliant } from "../parseECMACompliant";
import { ESTree } from "cherow";

export function ESFunction(implementation: FunctionImplementation) {
  return {
    type: "function",
    properties: {
      prototype: ESObject()
    },
    function: {
      implementation
    }
  };
}

export function isESFunction(arg: any): arg is FunctionBinding {
  return arg.type === "function";
}

export const FunctionConstructor = ESFunction(function*(
  _self: Any,
  args: Any[],
  execContext: TExecutionContext
) {
  const blockStatement = ((parseECMACompliant(
    `() => {${unsafeCast<TESString>(args[0]).value as string}}`
  ).body[0] as ESTree.ExpressionStatement)
    .expression as ESTree.ArrowFunctionExpression)
    .body as ESTree.BlockStatement;
  return [createFunction(blockStatement.body, []), execContext] as [
    FunctionBinding,
    TExecutionContext
  ];
});

export function createFunction(
  statements: ESTree.Statement[],
  params: Array<ESTree.Pattern>
) {
  return {
    type: "function",
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
              unsafeCast<ESTree.Identifier>(parameter).name,
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
