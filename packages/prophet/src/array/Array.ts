import { reverse } from "./reverse";
import { join } from "./join";
import { Number, TESNumber, GreaterThanEquals } from "../types";
import { unsafeCast } from "../unsafeGet";

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
): typeof Number | TESNumber | GreaterThanEquals {
  if (!value) {
    return Number;
  }
  if (concrete) {
    return { number: value.length };
  }
  return unsafeCast<Array<TArray<any>>>(value).reduce(
    (result, part) => {
      if (!result) {
        return calculateLength(part.value, part.concrete);
      } else {
        const currentPartLength = calculateLength(part.value, part.concrete);
        if (currentPartLength === Number) {
          return {
            gte: unsafeCast<TESNumber>(result).value
          };
        }
        return {
          gte: unsafeCast<TESNumber>(currentPartLength).value
        };
      }
    },
    (undefined as any) as typeof Number | TESNumber | GreaterThanEquals
  );
}
