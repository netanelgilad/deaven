import { TString } from "../string/String";
import { Type, Undefined, ThrownValue } from "../types";
import { parse } from "@babel/parser";
import {
  ExpressionStatement,
  ArrowFunctionExpression,
  BlockStatement,
  LVal,
  Identifier,
  isReturnStatement,
  isThrowStatement,
  Statement
} from "@babel/types";
import {
  TExecutionContext,
  setVariableInScope
} from "../execution-context/ExecutionContext";
import { evaluate } from "../evaluate";
import { unsafeCast } from "../unsafeGet";
import { ESObject } from "../Object";

export const FunctionConstructor = {
  properties: {},
  parameters: [],
  function: {
    implementation: function*(
      _self: void,
      args: [TString],
      execContext: TExecutionContext
    ) {
      const blockStatement = ((parse(`() => {${args[0].value as string}}`)
        .program.body[0] as ExpressionStatement)
        .expression as ArrowFunctionExpression).body as BlockStatement;
      return [createFunction(blockStatement.body, []), execContext];
    }
  }
};

export function createFunction(statements: Statement[], params: Array<LVal>) {
  return {
    properties: {
      prototype: ESObject()
    },
    function: {
      implementation: function*(
        _self: Type,
        args: Array<Type>,
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

        let currExecContext = atferParametersInScopeExecContext;
        for (const statement of statements) {
          if (isReturnStatement(statement)) {
            if (!statement.argument) {
              return [Undefined, currExecContext] as [Type, TExecutionContext];
            }
            return evaluate(statement.argument, currExecContext);
          } else if (isThrowStatement(statement)) {
            const [thrownValue, newExecContext] = yield evaluate(
              statement.argument,
              currExecContext
            );
            return [ThrownValue(thrownValue), newExecContext] as [
              Type,
              TExecutionContext
            ];
          }

          [, currExecContext] = yield evaluate(statement, currExecContext);
        }

        return [Undefined, currExecContext] as [
          typeof Undefined,
          TExecutionContext
        ];
      }
    }
  };
}
