"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.SyntaxErrorConstructor = void 0;

var _Function = require("../Function/Function");

var _types = require("../types");

var _tuple = require("@deaven/tuple");

const SyntaxErrorConstructor = (0, _Function.ESFunction)(function* (self, args, execContext) {
  self.properties.message = args[0];
  return (0, _tuple.tuple)(_types.Undefined, execContext);
}); // @ts-ignore

exports.SyntaxErrorConstructor = SyntaxErrorConstructor;
SyntaxErrorConstructor.properties.prototype.properties.toString = (0, _Function.ESFunction)(function* (self, _args, execContext) {
  return (0, _tuple.tuple)(self.properties.message, execContext);
});