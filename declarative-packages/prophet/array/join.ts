import { Any, isArray } from "../types";
import { isUndefined } from "lodash";
import { TArray } from "./Array";
import { TESString, ESString } from "../string/String";
import { TExecutionContext } from "../execution-context/ExecutionContext";

export function* join(
  self: TArray<any>,
  args: [TESString, ...Array<Any>],
  execContext: TExecutionContext
) {
  const reduceArray = (arg: TArray<any>): TESString => {
    if (!arg.value) {
      return ESString();
    }
    return (arg.value as Array<TArray<any>>).reduce((result, part) => {
      let stringOfCurrentPart;
      if (isArray(part)) {
        stringOfCurrentPart = reduceArray(part);
      } else {
        stringOfCurrentPart = part;
      }

      let stringToConcatTo = result;
      if (
        !isUndefined(stringToConcatTo.value) &&
        !isUndefined(stringOfCurrentPart.value)
      ) {
        stringToConcatTo.value =
          (stringToConcatTo.value as string) +
          args[0].value +
          stringOfCurrentPart.value;
        return result;
      } else {
        return ESString([result, stringOfCurrentPart as TESString]);
      }
    }, ESString(""));
  };

  return [reduceArray(self), execContext];
}
