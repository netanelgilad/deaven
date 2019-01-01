import { isObject, keys } from "lodash";
import { TString } from "./string/String";
import { TExecutionContext } from "./execution-context/ExecutionContext";
import { TESObject } from "./Object";

export const NotANumber = {};
export const Number = {};
export const TODOTYPE = {};
export const Undefined = {};

export function isString(arg: any): arg is TString {
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
  implementation: (
    self: Type,
    args: Array<Type>,
    execContext: TExecutionContext
  ) => IterableIterator<[Type, TExecutionContext]>;
};

export function isFunction(arg: any): arg is Function {
  return (
    isObject(arg) && keys(arg).length === 1 && keys(arg)[0] === "implementation"
  );
}

export type FunctionBinding = WithProperties & {
  self?: Type;
  function: Function;
};

export type WithProperties = {
  properties: {
    [name: string]: Type;
  };
};

export type TThrownValue = {
  type: "ThrownValue";
  value: Type;
};

export function ThrownValue(value: Type) {
  return {
    type: "ThrownValue",
    value
  };
}

export function isThrownValue(arg: any): arg is TThrownValue {
  return arg.type === "ThrownValue";
}

export type Type =
  | typeof NotANumber
  | TString
  | typeof Number
  | typeof Undefined
  | NumberLiteral
  | GreaterThanEquals
  | Function
  | TESObject
  | FunctionBinding
  | TThrownValue;
