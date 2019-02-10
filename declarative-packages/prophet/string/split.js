"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.split = split;

var _String = require("./String");

var _Array = require("../array/Array");

function* split(self, args, execContext) {
  return [(0, _Array.Array)(self.value.map(part => {
    if (part.value) {
      return (0, _Array.Array)(part.value.split(args[0].value).map(string => (0, _String.ESString)(string)), true);
    }

    return (0, _Array.Array)();
  })), execContext];
}