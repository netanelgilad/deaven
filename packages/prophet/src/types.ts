import { isObject, keys } from "lodash";
import { TString } from "./string/String";

export const NotANumber = {};
export const Number = {};
export const TODOTYPE = {};

export function isString(arg: any) {
  return arg.type === "string";
}

export function isArray(arg: any) {
  return arg.type === "array";
}

export type NumberLiteral = {
  number: number;
};

export type GreaterThanEquals = {
  gte: number;
};

export type Function = {
  implementation: (self: Type, args: Array<Type>) => Type;
};

export function isFunction(arg: any): arg is Function {
  return (
    isObject(arg) && keys(arg).length === 1 && keys(arg)[0] === "implementation"
  );
}

export type FunctionBinding = {
  self: Type;
  function: Function;
};

export type WithProperties = {
  properties: {
    [name: string]: Type;
  };
};

export type Type =
  | typeof NotANumber
  | TString
  | typeof Number
  | NumberLiteral
  | GreaterThanEquals
  | Function
  | FunctionBinding;
