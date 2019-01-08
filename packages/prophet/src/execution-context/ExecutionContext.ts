import { Any } from "../types";
import { TESObject } from "../Object";

export type TExecutionContext = {
  value: {
    thisValue: Any;
    scope: {
      [identifier: string]: Any;
    };
    global: TESObject;
    stderr: string;
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
  val: Any
): TExecutionContext {
  return ExecutionContext({ ...execContext.value, thisValue: val });
}

export function setVariableInScope(
  execContext: TExecutionContext,
  name: string,
  val: Any
) {
  return ExecutionContext({
    ...execContext.value,
    scope: { ...execContext.value.scope, [name]: val }
  });
}
