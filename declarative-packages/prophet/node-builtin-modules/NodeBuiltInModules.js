"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.NodeBuiltinModules = void 0;

var _vm = require("./vm");

const NodeBuiltinModules = new Map([["vm", _vm.vm]]);
exports.NodeBuiltinModules = NodeBuiltinModules;