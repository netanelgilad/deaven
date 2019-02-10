"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.nodeInitialExecutionContext = void 0;

var _ExecutionContext = require("./ExecutionContext");

var _prompt = require("../window/prompt");

var _require = require("../require/require");

var _ESInitialGlobal = require("./ESInitialGlobal");

const nodeInitialExecutionContext = (0, _ExecutionContext.ExecutionContext)({
  global: {
    properties: { ..._ESInitialGlobal.ESInitialGlobal.properties,
      prompt: {
        parameters: [],
        function: {
          implementation: _prompt.prompt
        }
      }
    }
  },
  scope: {
    require: _require.requireFunction
  }
});
exports.nodeInitialExecutionContext = nodeInitialExecutionContext;