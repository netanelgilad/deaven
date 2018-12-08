import { split } from "./split";
import { substr } from "./substr";
import {
  Number,
  WithProperties,
  NumberLiteral,
  GreaterThanEquals
} from "../types";

export type TString = WithProperties & {
  type: "string";
  value?: string | Array<TString>;
};

export function String(value?: string | Array<TString>): TString {
  return {
    type: "string",
    properties: {
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
