"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Array = Array;

var _reverse = require("./reverse");

var _join = require("./join");

var _types = require("../types");

function Array(value, concrete) {
  return {
    type: "array",
    properties: {
      reverse: {
        implementation: _reverse.reverse
      },
      join: {
        implementation: _join.join
      },
      length: calculateLength(value, concrete)
    },
    value,
    concrete
  };
}

function calculateLength(value, concrete) {
  if (!value) {
    return _types.Number;
  }

  if (concrete) {
    return {
      number: value.length
    };
  }

  return value.reduce((result, part) => {
    if (!result) {
      return calculateLength(part.value, part.concrete);
    } else {
      const currentPartLength = calculateLength(part.value, part.concrete);

      if (currentPartLength === _types.Number) {
        return {
          gte: result.value
        };
      }

      return {
        gte: currentPartLength.value
      };
    }
  }, undefined);
}