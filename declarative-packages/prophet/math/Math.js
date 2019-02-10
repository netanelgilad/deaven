"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Math = void 0;

var _round = require("./round");

const Math = {
  properties: {
    round: {
      implementation: _round.round
    }
  }
};
exports.Math = Math;