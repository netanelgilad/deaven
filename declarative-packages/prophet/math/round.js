"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.round = round;

var _types = require("../types");

function* round(_self, args, execContext) {
  if (!args[0] || (0, _types.isESString)(args[0])) {
    return [_types.NotANumber, execContext];
  } else {
    return [{
      number: Math.round(args[0].value)
    }, execContext];
  }
}