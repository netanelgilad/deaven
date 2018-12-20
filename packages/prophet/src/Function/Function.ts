import { TString } from "../string/String";
import { Type } from "../types";
import { parse } from "@babel/parser";
import { ExpressionStatement, ArrowFunctionExpression } from "@babel/types";
import { TExecutionContext } from "../execution-context/ExecutionContext";
import { evaluate } from "../evaluate";

// export function Function(value) {
//   return {
//     value
//   };
// }

export const FunctionConstructor = {
  function: {
    implementation(
      _self: void,
      args: [TString],
      execContext: TExecutionContext
    ) {
      const blockStatement = ((parse(`() => {${args[0].value as string}}`)
        .program.body[0] as ExpressionStatement)
        .expression as ArrowFunctionExpression).body;
      return [
        {
          function: {
            implementation(
              _self: void,
              args: Array<Type>,
              execContext: TExecutionContext
            ) {
              return evaluate(blockStatement, execContext);
            }
          }
        },
        execContext
      ];
    }
  }
};
