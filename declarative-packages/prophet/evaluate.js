"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.evaluate = evaluate;
exports.evaluateCode = evaluateCode;
exports.evaluateCodeAsExpression = evaluateCodeAsExpression;
exports.evaluateThrowableIterator = evaluateThrowableIterator;
exports.CodeEvaluationError = exports.ASTEvaluationError = void 0;

var _types = require("./types");

var _ASTResolvers = require("./ASTResolvers");

var assert = _interopRequireWildcard(require("assert"));

var _ExecutionContext = require("./execution-context/ExecutionContext");

var _parseECMACompliant = require("./parseECMACompliant");

var _cherow = require("cherow");

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = Object.defineProperty && Object.getOwnPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : {}; if (desc.get || desc.set) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } } newObj.default = obj; return newObj; } }

class ASTEvaluationError extends Error {
  constructor(err, ast) {
    super(err.message);
    this.ast = ast;
    this.stack = err.stack;
  }

}

exports.ASTEvaluationError = ASTEvaluationError;

class CodeEvaluationError extends ASTEvaluationError {
  constructor(astError, code) {
    super(astError, astError.ast);
    this.code = code;
    this.stack = astError.stack;
  }

}

exports.CodeEvaluationError = CodeEvaluationError;

function evaluate(ast, execContext) {
  try {
    const resolver = _ASTResolvers.ASTResolvers.get(ast.type);

    assert(resolver, `Can't resolve type of ast type ${ast.type}`);
    const resultIter = resolver(ast, execContext || (0, _ExecutionContext.ExecutionContext)({}));
    return evaluateThrowableIterator(resultIter);
  } catch (err) {
    if (err instanceof ASTEvaluationError || err instanceof CodeEvaluationError) {
      throw err;
    }

    throw new ASTEvaluationError(err, ast);
  }
}

function evaluateCode(code, execContext) {
  try {
    return evaluate((0, _parseECMACompliant.parseECMACompliant)(code), execContext);
  } catch (err) {
    if (err instanceof CodeEvaluationError) {
      throw err;
    } else if (err instanceof ASTEvaluationError) {
      throw new CodeEvaluationError(err, code);
    }

    throw err;
  }
}

function evaluateCodeAsExpression(code, execContext) {
  return evaluate((0, _cherow.parseScript)(code), execContext);
}

function evaluateThrowableIterator(itr) {
  let currentEvaluationResult = itr.next();

  while (!(0, _types.isThrownValue)(currentEvaluationResult.value[0]) && !(0, _types.isReturnValue)(currentEvaluationResult.value[0]) && !currentEvaluationResult.done) {
    currentEvaluationResult = itr.next(currentEvaluationResult.value);
  }

  return currentEvaluationResult.value;
}