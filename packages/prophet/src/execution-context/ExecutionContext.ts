export type TExecutionContext = {
  value: any;
};

export function ExecutionContext(value: any) {
  return {
    type: "ExecutionContext",
    value
  };
}
