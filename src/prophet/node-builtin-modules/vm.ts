import {
  TExecutionContext,
  ExecutionContext
} from "../execution-context/ExecutionContext";
import { Any, ThrownValue } from "../types";
import produce from "immer";
import { evaluateCode } from "../evaluate";
import { TESString, ESString } from "../string/String";
import { unsafeCast } from "@deaven/unsafe-cast.macro";
import { ESInitialGlobal } from "../execution-context/ESInitialGlobal";
import { TESObject, ESObject, createNewObjectFromConstructor } from "../Object";
import { tuple } from "@deaven/tuple";
import { SyntaxErrorConstructor } from "../error/SyntaxError";

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
          try {
            return evaluateCode(
              unsafeCast<string>(unsafeCast<TESString>(args[0]).value),
              evalExecContext
            );
          } catch (err) {
            if (err instanceof SyntaxError) {
              const [
                syntaxError,
                afterErrorExecContext
              ] = yield* createNewObjectFromConstructor(
                SyntaxErrorConstructor,
                [ESString(err.stack)],
                evalExecContext
              );
              return tuple(ThrownValue(syntaxError), afterErrorExecContext);
            }
            throw err;
          }
        }
      }
    }
  }
};
