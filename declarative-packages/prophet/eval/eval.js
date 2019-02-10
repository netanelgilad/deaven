"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.evalFn = void 0;

var _Function = require("../Function/Function");

var _types = require("../types");

var _tuple = require("@deaven/tuple");

var _evaluate = require("../evaluate");

var _parseECMACompliant = require("../parseECMACompliant");

const evalFn = (0, _Function.ESFunction)(function* (_self, args, execContext) {
  const source = args[0].value;
  const parsedSource = (0, _parseECMACompliant.parseECMACompliant)(source);
  const statements = parsedSource.body;
  let currentEvaluationResult = (0, _tuple.tuple)(_types.Undefined, execContext);

  for (const statement of statements.slice(0, statements.length - 1)) {
    currentEvaluationResult = yield (0, _evaluate.evaluate)(statement, currentEvaluationResult[1]);
  }

  const lastStatement = statements[statements.length - 1];

  if (lastStatement.type === "ExpressionStatement") {
    return (0, _evaluate.evaluate)(lastStatement.expression, currentEvaluationResult[1]);
  }

  return (0, _evaluate.evaluate)(lastStatement, currentEvaluationResult[1]);
});
exports.evalFn = evalFn;