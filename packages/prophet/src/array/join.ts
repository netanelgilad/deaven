import { Type, isArray } from "../types";
import { isUndefined } from "lodash";
import { TArray } from "./Array";
import { TString, String } from "../string/String";
import { TExecutionContext } from "../execution-context/ExecutionContext";

export function* join(
  self: TArray<any>,
  args: [TString, ...Array<Type>],
  execContext: TExecutionContext
) {
  const reduceArray = (arg: TArray<any>): TString => {
    if (!arg.value) {
      return String();
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
        return String([result, stringOfCurrentPart as TString]);
      }
    }, String(""));
  };

  return [reduceArray(self), execContext];
}
