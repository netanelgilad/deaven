import {
  TExecutionContext,
  ExecutionContext
} from "../execution-context/ExecutionContext";
import { Type } from "../types";
import produce from "immer";
import { evaluateCode } from "../evaluate";
import { TString } from "../string/String";
import { unsafeCast } from "../unsafeGet";
import { ESInitialGlobal } from "../execution-context/ESInitialGlobal";
import { TESObject } from "../Object";

export const vm = {
  properties: {
    createContext: {
      parameters: [],
      function: {
        implementation: function*(
          _self: Type,
          args: Array<Type>,
          execContext: TExecutionContext
        ) {
          return [args[0], execContext];
        }
      }
    },
    runInContext: {
      parameters: [],
      function: {
        implementation: function*(
          _self: Type,
          args: Array<Type>,
          execContext: TExecutionContext
        ) {
          const evalExecContext = ExecutionContext(
            produce(execContext.value, draft => {
              draft.global = {
                properties: {
                  ...ESInitialGlobal.properties,
                  ...unsafeCast<TESObject>(args[1]).properties
                }
              };
            })
          );
          return evaluateCode(
            unsafeCast<string>(unsafeCast<TString>(args[0]).value),
            evalExecContext
          );
        }
      }
    }
  }
};
