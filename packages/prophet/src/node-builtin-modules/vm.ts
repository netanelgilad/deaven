import {
  TExecutionContext,
  ExecutionContext
} from "../execution-context/ExecutionContext";
import { Type } from "../types";
import produce from "immer";
import { evaluateCode } from "../evaluate";
import { TString } from "../string/String";
import { unsafeCast } from "../unsafeGet";

export const vm = {
  properties: {
    createContext: {
      parameters: [],
      function: {
        implementation: (
          _self: Type,
          args: Array<Type>,
          execContext: TExecutionContext
        ) => {
          return [args[0], execContext];
        }
      }
    },
    runInContext: {
      parameters: [],
      function: {
        implementation: (
          _self: Type,
          args: Array<Type>,
          execContext: TExecutionContext
        ) => {
          const evalExecContext = ExecutionContext(
            produce(execContext.value, draft => {
              draft.global = args[1];
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
