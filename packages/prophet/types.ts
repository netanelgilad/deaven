import { isObject, keys, last } from "lodash";

export const NotANumber = {};
export const String = {};
export const Number = {};
export const TODOTYPE = {};

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

export type Concatenation = {
  parts: any[];
};

export function isConcatenation(arg): arg is Concatenation {
  return isObject(arg) && keys(arg).length === 1 && keys(arg)[0] === "parts";
}

export type GreaterThanEquals = {
  gte: number;
};

export function isGreaterThanEquals(arg): arg is GreaterThanEquals {
  return isObject(arg) && keys(arg).length === 1 && keys(arg)[0] === "gte";
}

export type Split = {
  split: any;
};

export type Function = {
  implementation: (self: any, args: Array<Type>) => Type;
};

export type Type =
  | typeof NotANumber
  | typeof String
  | typeof Number
  | NumberLiteral
  | StringLiteral
  | Concatenation
  | GreaterThanEquals
  | Split
  | Function;
