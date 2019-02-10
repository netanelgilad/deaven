"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.reverse = reverse;

var _types = require("../types");

var _Array = require("./Array");

function* reverse(self, _args, execContext) {
  return [(0, _Array.Array)(self.value.reverse().map(part => {
    if ((0, _types.isArray)(part) && part.value) {
      return (0, _Array.Array)(part.value.reverse(), part.concrete);
    }

    return part;
  }), self.concrete), execContext];
}