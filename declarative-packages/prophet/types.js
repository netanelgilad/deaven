"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.isESNull = isESNull;
exports.isUndefined = isUndefined;
exports.isESString = isESString;
exports.isArray = isArray;
exports.ESNumber = ESNumber;
exports.isESNumber = isESNumber;
exports.isFunction = isFunction;
exports.ValueIdentifier = ValueIdentifier;
exports.ReturnValue = ReturnValue;
exports.isReturnValue = isReturnValue;
exports.ThrownValue = ThrownValue;
exports.isThrownValue = isThrownValue;
exports.isESBoolean = isESBoolean;
exports.Undefined = exports.ESNull = exports.TODOTYPE = exports.Number = exports.NotANumber = void 0;

var _lodash = require("lodash");

const NotANumber = {};
exports.NotANumber = NotANumber;
const Number = {};
exports.Number = Number;
const TODOTYPE = {};
exports.TODOTYPE = TODOTYPE;
const ESNull = {
  type: "null"
};
exports.ESNull = ESNull;

function isESNull(arg) {
  return arg.type === "null";
}

const Undefined = {
  type: "undefined"
};
exports.Undefined = Undefined;

function isUndefined(arg) {
  return arg.type === "undefined";
}

function isESString(arg) {
  return arg.type === "string";
}

function isArray(arg) {
  return arg.type === "array";
}

function ESNumber(value) {
  return {
    type: "number",
    id: ValueIdentifier(),
    properties: {},
    value
  };
}

function isESNumber(arg) {
  return arg.type === "number";
}

function isFunction(arg) {
  return (0, _lodash.isObject)(arg) && (0, _lodash.keys)(arg).length === 1 && (0, _lodash.keys)(arg)[0] === "implementation";
}

function ValueIdentifier() {
  return {};
}

function ReturnValue(value) {
  return {
    type: "ReturnValue",
    value
  };
}

function isReturnValue(arg) {
  return arg.type === "ReturnValue";
}

function ThrownValue(value) {
  return {
    type: "ThrownValue",
    value
  };
}

function isThrownValue(arg) {
  return arg.type === "ThrownValue";
}

function isESBoolean(arg) {
  return arg.type === "boolean";
}