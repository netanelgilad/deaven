import { reverse } from "./reverse";
import { join } from "./join";
import { isArray } from "lodash";
import { Number, NumberLiteral, GreaterThanEquals } from "../types";

export type TArray<T> = {
  value?: Array<T> | Array<TArray<T>>;
  concrete?: boolean;
};

export function Array<T>(
  value?: Array<T> | Array<TArray<T>>,
  concrete?: boolean
) {
  return {
    type: "array",
    properties: {
      reverse: {
        implementation: reverse
      },
      join: {
        implementation: join
      },
      length: calculateLength(value, concrete)
    },
    value,
    concrete
  };
}

function calculateLength(
  value?: string | Array<TArray<any>>,
  concrete?: boolean
): typeof Number | NumberLiteral | GreaterThanEquals {
  if (!value) {
    return Number;
  }
  if (concrete) {
    return { number: value.length };
  }
  return (value as Array<TArray<any>>).reduce(
    (result, part) => {
      if (!result) {
        return calculateLength(part.value, part.concrete);
      } else {
        const currentPartLength = calculateLength(part.value, part.concrete);
        if (currentPartLength === Number) {
          return {
            gte: (result as NumberLiteral).number
          };
        }
        return {
          gte: (currentPartLength as NumberLiteral).number
        };
      }
    },
    (undefined as any) as typeof Number | NumberLiteral | GreaterThanEquals
  );
}
