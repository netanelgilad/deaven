import { split } from "./split";
import { substr } from "./substr";
import {
  Number,
  WithProperties,
  Any,
  GreaterThanEquals,
  TESNumber,
  WithValue,
  ValueIdentifier,
  Type
} from "../types";
import { TExecutionContext } from "../execution-context/ExecutionContext";
import { ESFunction } from "../Function/Function";

export interface TESString
  extends Type<"string">,
    WithProperties,
    WithValue<string | Array<TESString>> {}

export function ESString(value?: string | Array<TESString>): TESString {
  return {
    type: "string",
    id: ValueIdentifier(),
    properties: {
      toString: {
        function: {
          implementation: function*(
            self: TESString,
            _args: Array<Any>,
            execContext: TExecutionContext
          ) {
            return [self, execContext];
          }
        }
      },
      split: {
        implementation: split
      },
      substr: {
        implementation: substr
      },
      length: calculateLength(value)
    },
    value
  };
}

export const StringConstructor = ESFunction(function*(
  _self: Any,
  args: Any[],
  execContext
) {
  return [args[0], execContext] as [Any, TExecutionContext];
});

function calculateLength(
  value?: string | Array<TESString>
): typeof Number | TESNumber | GreaterThanEquals {
  if (!value) {
    return Number;
  }
  if (typeof value === "string") {
    return { number: value.length };
  }
  return value.reduce(
    (result, part) => {
      if (!result) {
        return calculateLength(part.value);
      } else {
        return {
          gte: (result as TESNumber).value
        };
      }
    },
    (undefined as any) as typeof Number | Any | GreaterThanEquals
  );
}
