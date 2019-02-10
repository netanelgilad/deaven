"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.ESBoolean = ESBoolean;
exports.coerceToBoolean = coerceToBoolean;
exports.ESBooleanConstructor = void 0;

var _types = require("../types");

var _unimplemented = require("@deaven/unimplemented");

var _Object = require("../Object");

var _Function = require("../Function/Function");

function ESBoolean(value) {
  return {
    type: "boolean",
    id: (0, _types.ValueIdentifier)(),
    properties: {},
    value
  };
}

function coerceToBoolean(val) {
  if ((0, _types.isESBoolean)(val)) {
    return val;
  }

  if ((0, _types.isESNumber)(val)) {
    return typeof val.value === "number" ? val.value === 0 ? ESBoolean(false) : ESBoolean(true) : ESBoolean();
  }

  if ((0, _types.isESNull)(val) || (0, _types.isUndefined)(val)) {
    return ESBoolean(false);
  }

  if ((0, _types.isESString)(val)) {
    return typeof val.value === "string" ? val.value === "" ? ESBoolean(false) : ESBoolean(true) : (0, _unimplemented.unimplemented)();
  }

  if ((0, _Object.isESObject)(val)) {
    return ESBoolean(true);
  }

  if ((0, _Function.isESFunction)(val)) {
    return ESBoolean(true);
  }

  return (0, _unimplemented.unimplemented)();
}

const ESBooleanConstructor = (0, _Function.ESFunction)(function* (_self, args, execContext) {
  return [coerceToBoolean(args[0] || _types.Undefined), execContext];
});
exports.ESBooleanConstructor = ESBooleanConstructor;