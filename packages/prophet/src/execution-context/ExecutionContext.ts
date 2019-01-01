import { Type } from "../types";
import { TESObject } from "../Object";

export type TExecutionContext = {
  value: {
    thisValue: Type;
    scope: {
      [identifier: string]: Type;
    };
    global: TESObject;
    stdout: string;
  };
};

export function ExecutionContext(value: any) {
  return {
    type: "ExecutionContext",
    value
  };
}

export function setCurrentThisValue(
  execContext: TExecutionContext,
  val: Type
): TExecutionContext {
  return ExecutionContext({ ...execContext.value, thisValue: val });
}

export function setVariableInScope(
  execContext: TExecutionContext,
  name: string,
  val: Type
) {
  return ExecutionContext({
    ...execContext.value,
    scope: { ...execContext.value.scope, [name]: val }
  });
}
