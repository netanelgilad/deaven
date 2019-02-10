import { getSync } from "stacktrace-js";

export function unimplemented(functionName?: string): any {
  const callerInfo = getSync()[1];
  throw new Error(
    `${functionName ||
      callerInfo.functionName} hasn't been implemeneted yet! Find it at ${
      callerInfo.fileName
    }:${callerInfo.lineNumber}:${callerInfo.columnNumber}`
  );
}
