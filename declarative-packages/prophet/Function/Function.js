"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.ESFunction = ESFunction;
exports.isESFunction = isESFunction;
exports.createFunction = createFunction;
exports.FunctionConstructor = void 0;

var _types = require("../types");

var _ExecutionContext = require("../execution-context/ExecutionContext");

var _evaluate = require("../evaluate");

var _Object = require("../Object");

var _tuple = require("@deaven/tuple");

var _parseECMACompliant = require("../parseECMACompliant");

function ESFunction(implementation) {
  return {
    type: "function",
    properties: {
      prototype: (0, _Object.ESObject)()
    },
    function: {
      implementation
    }
  };
}

function isESFunction(arg) {
  return arg.type === "function";
}

const FunctionConstructor = ESFunction(function* (_self, args, execContext) {
  const blockStatement = (0, _parseECMACompliant.parseECMACompliant)(`() => {${args[0].value}}`).body[0].expression.body;
  return [createFunction(blockStatement.body, []), execContext];
});
exports.FunctionConstructor = FunctionConstructor;

function createFunction(statements, params) {
  return {
    type: "function",
    properties: {
      prototype: (0, _Object.ESObject)()
    },
    function: {
      implementation: function* (_self, args, execContext) {
        const atferParametersInScopeExecContext = params.reduce((prevContext, parameter, index) => (0, _ExecutionContext.setVariableInScope)(prevContext, parameter.name, args[index]), execContext);
        let currentEvaluationResult = (0, _tuple.tuple)(_types.Undefined, atferParametersInScopeExecContext);

        for (const statement of statements) {
          currentEvaluationResult = (0, _evaluate.evaluate)(statement, currentEvaluationResult[1]);

          if ((0, _types.isReturnValue)(currentEvaluationResult[0])) {
            return (0, _tuple.tuple)(currentEvaluationResult[0].value, currentEvaluationResult[1]);
          } else {
            yield currentEvaluationResult;
          }
        }

        return (0, _tuple.tuple)(_types.Undefined, currentEvaluationResult[1]);
      }
    }
  };
}