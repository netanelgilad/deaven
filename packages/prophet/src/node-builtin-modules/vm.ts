import {
  TExecutionContext,
  ExecutionContext
} from "../execution-context/ExecutionContext";
import { Any } from "../types";
import produce from "immer";
import { evaluateCode } from "../evaluate";
import { TESString } from "../string/String";
import { unsafeCast } from "../unsafeGet";
import { ESInitialGlobal } from "../execution-context/ESInitialGlobal";
import { TESObject, ESObject } from "../Object";

export const vm = {
  properties: {
    createContext: {
      parameters: [],
      function: {
        implementation: function*(
          _self: Any,
          args: Array<Any>,
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
          _self: Any,
          args: Array<Any>,
          execContext: TExecutionContext
        ) {
          const evalExecContext = ExecutionContext(
            produce(execContext.value, draft => {
              draft.global = ESObject({
                ...ESInitialGlobal.properties,
                ...unsafeCast<TESObject>(args[1]).properties
              });
            })
          );
          return evaluateCode(
            unsafeCast<string>(unsafeCast<TESString>(args[0]).value),
            evalExecContext
          );
        }
      }
    }
  }
};
