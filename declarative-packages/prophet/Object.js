"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.ESObject = ESObject;
exports.isESObject = isESObject;
exports.createNewObjectFromConstructor = createNewObjectFromConstructor;

var _types = require("./types");

var _ExecutionContext = require("./execution-context/ExecutionContext");

var _tuple = require("@deaven/tuple");

function ESObject(value) {
  return {
    type: "object",
    id: (0, _types.ValueIdentifier)(),
    properties: value || {},
    value
  };
}

function isESObject(arg) {
  return arg.type === "object";
}

function* createNewObjectFromConstructor(calleeType, argsTypes, execContext) {
  const thisValue = ESObject({});
  const currExecContext = (0, _ExecutionContext.setCurrentThisValue)(execContext, thisValue);
  const [, afterCallExecContext] = yield* calleeType.function.implementation(thisValue, argsTypes, currExecContext);
  return (0, _tuple.tuple)(ESObject({ ...calleeType.properties.prototype.properties,
    ...afterCallExecContext.value.thisValue.value
  }), afterCallExecContext);
}