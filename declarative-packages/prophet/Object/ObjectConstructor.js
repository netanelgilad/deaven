"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.ObjectConstructor = void 0;

var _Function = require("../Function/Function");

var _tuple = require("@deaven/tuple");

const ObjectConstructor = (0, _Function.ESFunction)(function* (_self, args, execContext) {
  return (0, _tuple.tuple)(args[0], execContext);
});
exports.ObjectConstructor = ObjectConstructor;