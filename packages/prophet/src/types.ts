import { isObject, keys } from "lodash";
import { TESString } from "./string/String";
import { TExecutionContext } from "./execution-context/ExecutionContext";
import { TESObject } from "./Object";
import { NumberLiteral } from "@babel/types";
import { unsafeCast } from "./unsafeGet";

export const NotANumber = {};
export const Number = {};
export const TODOTYPE = {};

export type TESUndefined = Type<"undefined">;

export const Undefined: TESUndefined = {
  type: "undefined"
};

export function isString(arg: any): arg is TESString {
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

export type FunctionImplementation = (
  self: Any,
  args: Array<Any>,
  execContext: TExecutionContext
) => IterableIterator<[EvaluationResult, TExecutionContext]>;

export type Function = {
  implementation: FunctionImplementation;
};

export function isFunction(arg: any): arg is Function {
  return (
    isObject(arg) && keys(arg).length === 1 && keys(arg)[0] === "implementation"
  );
}

export type FunctionBinding = WithProperties & {
  self?: Any;
  function: Function;
};

export type WithProperties = {
  properties: {
    [name: string]: Any;
  };
};

export function ValueIdentifier() {
  return {} as object;
}

export type Type<T extends string> = {
  type: T;
};

export type TValueIdentifier = ReturnType<typeof ValueIdentifier>;

export type WithValue<T> = {
  id?: TValueIdentifier;
  value?: T;
};

export type TReturnValue = {
  type: "ReturnValue";
  value: Any;
};

export function ReturnValue(value: Any) {
  return {
    type: "ReturnValue",
    value
  };
}

export function isReturnValue(arg: any): arg is TReturnValue {
  return arg.type === "ReturnValue";
}

export type TThrownValue = {
  type: "ThrownValue";
  value: Any;
};

export function ThrownValue(value: Any) {
  return {
    type: "ThrownValue",
    value
  };
}

export function isThrownValue(arg: any): arg is TThrownValue {
  return arg.type === "ThrownValue";
}

export type TESBoolean = Type<"boolean"> &
  WithProperties &
  WithValue<boolean> & {};

export function isESBoolean(arg: Any): arg is TESBoolean {
  return unsafeCast<Type<string>>(arg).type === "boolean";
}

export type Any =
  | Type<string>
  | typeof NotANumber
  | TESString
  | typeof Number
  | TESUndefined
  | NumberLiteral
  | GreaterThanEquals
  | Function
  | TESObject
  | FunctionBinding
  | TESBoolean
  | TThrownValue;

export type ExpressionEvaluationResult = TThrownValue | Any;
export type ControlFlowResult = TThrownValue | TReturnValue | undefined;
export type EvaluationResult = Any | ControlFlowResult;
