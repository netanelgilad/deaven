"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.unimplemented = unimplemented;

var _stacktraceJs = require("stacktrace-js");

function unimplemented(functionName) {
  const callerInfo = (0, _stacktraceJs.getSync)()[1];
  throw new Error(`${functionName || callerInfo.functionName} hasn't been implemeneted yet! Find it at ${callerInfo.fileName}:${callerInfo.lineNumber}:${callerInfo.columnNumber}`);
}