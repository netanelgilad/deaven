"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.join = join;

var _types = require("../types");

var _lodash = require("lodash");

var _String = require("../string/String");

function* join(self, args, execContext) {
  const reduceArray = arg => {
    if (!arg.value) {
      return (0, _String.ESString)();
    }

    return arg.value.reduce((result, part) => {
      let stringOfCurrentPart;

      if ((0, _types.isArray)(part)) {
        stringOfCurrentPart = reduceArray(part);
      } else {
        stringOfCurrentPart = part;
      }

      let stringToConcatTo = result;

      if (!(0, _lodash.isUndefined)(stringToConcatTo.value) && !(0, _lodash.isUndefined)(stringOfCurrentPart.value)) {
        stringToConcatTo.value = stringToConcatTo.value + args[0].value + stringOfCurrentPart.value;
        return result;
      } else {
        return (0, _String.ESString)([result, stringOfCurrentPart]);
      }
    }, (0, _String.ESString)(""));
  };

  return [reduceArray(self), execContext];
}