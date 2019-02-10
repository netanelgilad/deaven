"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.ExecutionContext = ExecutionContext;
exports.setCurrentThisValue = setCurrentThisValue;
exports.setVariableInScope = setVariableInScope;

function ExecutionContext(value) {
  return {
    type: "ExecutionContext",
    value
  };
}

function setCurrentThisValue(execContext, val) {
  return ExecutionContext({ ...execContext.value,
    thisValue: val
  });
}

function setVariableInScope(execContext, name, val) {
  return ExecutionContext({ ...execContext.value,
    scope: { ...execContext.value.scope,
      [name]: val
    }
  });
}