"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
Object.defineProperty(exports, "evaluate", {
  enumerable: true,
  get: function () {
    return _evaluate.evaluate;
  }
});
Object.defineProperty(exports, "evaluateCode", {
  enumerable: true,
  get: function () {
    return _evaluate.evaluateCode;
  }
});
Object.defineProperty(exports, "evaluateCodeAsExpression", {
  enumerable: true,
  get: function () {
    return _evaluate.evaluateCodeAsExpression;
  }
});
Object.defineProperty(exports, "ASTEvaluationError", {
  enumerable: true,
  get: function () {
    return _evaluate.ASTEvaluationError;
  }
});
Object.defineProperty(exports, "CodeEvaluationError", {
  enumerable: true,
  get: function () {
    return _evaluate.CodeEvaluationError;
  }
});
Object.defineProperty(exports, "NotANumber", {
  enumerable: true,
  get: function () {
    return _types.NotANumber;
  }
});
Object.defineProperty(exports, "nodeInitialExecutionContext", {
  enumerable: true,
  get: function () {
    return _nodeInitialExecutionContext.nodeInitialExecutionContext;
  }
});

var _evaluate = require("./evaluate");

var _types = require("./types");

var _nodeInitialExecutionContext = require("./execution-context/nodeInitialExecutionContext");