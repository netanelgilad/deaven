import {
  isConcatenation,
  isNumberLiteral,
  isGreaterThanEquals,
  isStringLiteral,
  isString
} from "./types";

export const getLengthOfType = type => {
  if (isConcatenation(type)) {
    return type.parts.reduce(
      (result, part) => {
        const partLength = getLengthOfType(part);
        if (isNumberLiteral(partLength) && isNumberLiteral(result)) {
          return {
            number: partLength.number + result.number
          };
        } else if (isNumberLiteral(partLength) && isGreaterThanEquals(result)) {
          return {
            gte: partLength.number + result.gte
          };
        } else {
          return {
            gte: partLength.gte + result.number
          };
        }
      },
      { number: 0 }
    );
  } else if (isStringLiteral(type)) {
    return { number: type.string.length };
  } else if (isString(type)) {
    return {
      gte: 0
    };
  } else {
    return getLengthOfType(type.split);
  }
};
