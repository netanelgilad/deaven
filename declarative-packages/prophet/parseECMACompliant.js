"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.parseECMACompliant = parseECMACompliant;

var _cherow = require("cherow");

function parseECMACompliant(code) {
  return (0, _cherow.parseScript)(code, {
    loc: true
  });
}