"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.ESString = ESString;
exports.StringConstructor = void 0;

var _split = require("./split");

var _substr = require("./substr");

var _types = require("../types");

var _Function = require("../Function/Function");

function ESString(value) {
  return {
    type: "string",
    id: (0, _types.ValueIdentifier)(),
    properties: {
      toString: {
        function: {
          implementation: function* (self, _args, execContext) {
            return [self, execContext];
          }
        }
      },
      split: {
        implementation: _split.split
      },
      substr: {
        implementation: _substr.substr
      },
      length: calculateLength(value)
    },
    value
  };
}

const StringConstructor = (0, _Function.ESFunction)(function* (_self, args, execContext) {
  return [args[0], execContext];
});
exports.StringConstructor = StringConstructor;

function calculateLength(value) {
  if (!value) {
    return _types.Number;
  }

  if (typeof value === "string") {
    return {
      number: value.length
    };
  }

  return value.reduce((result, part) => {
    if (!result) {
      return calculateLength(part.value);
    } else {
      return {
        gte: result.value
      };
    }
  }, undefined);
}