import { isArray } from "../types";
import { TArray, Array } from "./Array";

export function reverse(self: TArray<any>) {
  return Array(
    (self.value as Array<TArray<any>>).reverse().map(part => {
      if (isArray(part) && part.value) {
        return Array(part.value.reverse(), part.concrete);
      }
      return part;
    }),
    self.concrete
  );
}
