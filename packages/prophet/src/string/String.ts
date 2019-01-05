import { split } from "./split";
import { substr } from "./substr";
import {
  Number,
  WithProperties,
  NumberLiteral,
  GreaterThanEquals,
  Type
} from "../types";
import { TExecutionContext } from "../execution-context/ExecutionContext";
import { ESFunction } from "../Function/Function";
import { exec } from "child_process";

export type TString = WithProperties & {
  type: "string";
  value?: string | Array<TString>;
};

export function String(value?: string | Array<TString>): TString {
  return {
    type: "string",
    properties: {
      toString: {
        function: {
          implementation: function*(
            _self: TString,
            args: Array<Type>,
            execContext: TExecutionContext
          ) {
            return [_self, execContext];
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
  _self: Type,
  args: Type[],
  execContext
) {
  return [args[0], execContext] as [Type, TExecutionContext];
});

function calculateLength(
  value?: string | Array<TString>
): typeof Number | NumberLiteral | GreaterThanEquals {
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
          gte: (result as NumberLiteral).number
        };
      }
    },
    (undefined as any) as typeof Number | NumberLiteral | GreaterThanEquals
  );
}
