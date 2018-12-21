import { TString } from "../string/String";
import { Type } from "../types";
import { parse } from "@babel/parser";
import {
  ExpressionStatement,
  ArrowFunctionExpression,
  BlockStatement,
  LVal,
  Identifier
} from "@babel/types";
import { TExecutionContext } from "../execution-context/ExecutionContext";
import { evaluate } from "../evaluate";
import { unsafeCast } from "../unsafeGet";

// export function Function(value) {
//   return {
//     value
//   };
// }

export const FunctionConstructor = {
  parameters: [],
  function: {
    implementation(
      _self: void,
      args: [TString],
      execContext: TExecutionContext
    ) {
      const blockStatement = ((parse(`() => {${args[0].value as string}}`)
        .program.body[0] as ExpressionStatement)
        .expression as ArrowFunctionExpression).body as BlockStatement;
      return [createFunction(blockStatement, []), execContext];
    }
  }
};

export function createFunction(body: BlockStatement, params: Array<LVal>) {
  return {
    parameters: params.map(x => unsafeCast<Identifier>(x).name),
    function: {
      implementation(
        _self: Type,
        args: Array<Type>,
        execContext: TExecutionContext
      ) {
        return evaluate(body, execContext);
      }
    }
  };
}
