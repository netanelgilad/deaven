"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.NumberConstructor = void 0;

var _Function = require("../Function/Function");

const NumberConstructor = (0, _Function.ESFunction)(function* (_self, args, execContext) {
  return [args[0], execContext];
});
exports.NumberConstructor = NumberConstructor;