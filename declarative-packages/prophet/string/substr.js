"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.substr = substr;

var _lodash = require("lodash");

var _String = require("./String");

function* substr(self, args, execContext) {
  return [(0, _String.ESString)((0, _lodash.first)(self.value).value.substr(args[0].value, args[1].value)), execContext];
}