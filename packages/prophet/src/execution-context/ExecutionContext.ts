import { Type } from "../types";

export type TExecutionContext = {
  value: any;
};

export function ExecutionContext(value: any) {
  return {
    type: "ExecutionContext",
    value
  };
}

export function setCurrentThisValue(execContext: TExecutionContext, val: Type) {
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
