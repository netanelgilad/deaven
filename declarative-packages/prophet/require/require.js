"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.requireFunction = void 0;

var _NodeBuiltInModules = require("../node-builtin-modules/NodeBuiltInModules");

const requireFunction = {
  parameters: [],
  function: {
    implementation: function* (_self, args, exeContext) {
      return [_NodeBuiltInModules.NodeBuiltinModules.get(args[0].value), exeContext];
    }
  }
};
exports.requireFunction = requireFunction;