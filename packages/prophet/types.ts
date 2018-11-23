import { isObject, keys, last } from "lodash";

export const NotANumber = {};
export const String = {};
export const Number = {};

export function isString(arg) {
  return arg === String || isStringLiteral(arg);
}

export type NumberLiteral = {
  number: number;
};

export function isNumberLiteral(arg): arg is NumberLiteral {
  return isObject(arg) && keys(arg).length === 1 && keys(arg)[0] === "number";
}

export type StringLiteral = {
  string: string;
};

export function isStringLiteral(arg): arg is StringLiteral {
  return isObject(arg) && keys(arg).length === 1 && keys(arg)[0] === "string";
}

export function isStringLiteralWithValue(arg, value: string) {
  return isStringLiteral(arg) && arg.string === value;
}

export type Concatenation = {
  parts: any[];
};

export function isConcatenation(arg): arg is Concatenation {
  return isObject(arg) && keys(arg).length === 1 && keys(arg)[0] === "parts";
}

export function isConcatenationEndsWithStringLiteral(
  concatenation: Concatenation,
  part: string
) {
  return (
    concatenation.parts.length > 0 &&
    isStringLiteralWithValue(last(concatenation.parts), part)
  );
}

export type GreaterThanEquals = {
    gte: number
}

export function isGreaterThanEquals(arg): arg is GreaterThanEquals {
    return isObject(arg) && keys(arg).length === 1 && keys(arg)[0] === "gte";
}

export type Split = {
    split: any
}

export function isSplit(arg): arg is Split {
    return isObject(arg) && keys(arg).length === 1 && keys(arg)[0] === "split";
}