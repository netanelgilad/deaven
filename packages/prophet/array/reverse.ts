import { Concatenation, isConcatenation } from "../types";

export function reverse(self: Concatenation) {
  return {
    parts: self.parts.reverse().map(part => {
      if (isConcatenation(part)) {
        return {
          parts: part.parts.reverse()
        };
      }
      return {
        reverse: part
      };
    })
  };
}
