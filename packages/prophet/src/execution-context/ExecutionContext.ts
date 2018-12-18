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
