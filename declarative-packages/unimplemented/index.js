'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var stacktraceJs = require('stacktrace-js');

function unimplemented(functionName) {
  const callerInfo = stacktraceJs.getSync()[1];
  throw new Error(`${functionName || callerInfo.functionName} hasn't been implemeneted yet! Find it at ${callerInfo.fileName}:${callerInfo.lineNumber}:${callerInfo.columnNumber}`);
}

exports.unimplemented = unimplemented;
