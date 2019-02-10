"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.ASTResolvers = exports.UnaryExpressionResolver = exports.UpdateExpressionResolver = exports.DoWhileStatementResolver = exports.ThrowStatementResolver = exports.TryStatementResolver = exports.LogicalExpressionResolver = exports.NewExpressionResolver = exports.EmptyStatementResolver = exports.IfStatementResolver = exports.FunctionDeclarationResolver = exports.VariableDeclarationResolver = exports.ExpressionStatementResolver = exports.FunctionExpressionResolver = exports.ObjectExpressionResolver = exports.ThisExpressionResolver = exports.ReturnStatementResolver = exports.AssignmentExpressionResolver = exports.BlockStatementResolver = exports.ProgramResolver = exports.BinaryExpressionResolver = exports.CallExpressionResolver = exports.MemberExpressionResolver = exports.LiteralResolver = exports.IdentifierResolver = exports.statementResolver = exports.noExecutionContextResolver = void 0;

var _String = require("./string/String");

var _types = require("./types");

var _evaluate = require("./evaluate");

var _operators = require("./operators");

var _ExecutionContext = require("./execution-context/ExecutionContext");

var _Function = require("./Function/Function");

var _util = require("util");

var _Object = require("./Object");

var _ESBoolean = require("./boolean/ESBoolean");

var _tuple = require("@deaven/tuple");

var _assert = _interopRequireDefault(require("assert"));

var _unimplemented = require("@deaven/unimplemented");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/// <reference types="node" />
const noExecutionContextResolver = fn => function* (ast, execContext) {
  return (0, _tuple.tuple)(fn(ast, execContext), execContext);
};

exports.noExecutionContextResolver = noExecutionContextResolver;

const statementResolver = fn => function* (ast, execContext) {
  const resultIter = fn(ast, execContext);
  return (0, _evaluate.evaluateThrowableIterator)(resultIter);
};

exports.statementResolver = statementResolver;
const IdentifierResolver = noExecutionContextResolver((ast, execContext) => {
  const resolvedFromScope = execContext.value.scope[ast.name];
  return resolvedFromScope || execContext.value.global.properties[ast.name] || _types.Undefined;
});
exports.IdentifierResolver = IdentifierResolver;
const LiteralResolver = noExecutionContextResolver(ast => {
  if (typeof ast.value === "string") {
    return (0, _String.ESString)(ast.value);
  } else if (typeof ast.value === "number") {
    return (0, _types.ESNumber)(ast.value);
  } else if (typeof ast.value === "boolean") {
    return (0, _ESBoolean.ESBoolean)(ast.value);
  } else if (ast.value === null) {
    return _types.ESNull;
  }

  return (0, _unimplemented.unimplemented)();
});
exports.LiteralResolver = LiteralResolver;

const MemberExpressionResolver = function* (ast, execContext) {
  const [objectType, newExecContext] = yield (0, _evaluate.evaluate)(ast.object, execContext);
  const propertyType = objectType.properties[ast.property.name];

  if ((0, _types.isFunction)(propertyType)) {
    return (0, _tuple.tuple)({
      self: objectType,
      function: propertyType
    }, newExecContext);
  } else {
    return (0, _tuple.tuple)(propertyType, newExecContext);
  }
};

exports.MemberExpressionResolver = MemberExpressionResolver;

const CallExpressionResolver = function* (ast, execContext) {
  let [calleeType, newExecContext] = yield (0, _evaluate.evaluate)(ast.callee, execContext);
  let currExecContext = newExecContext;
  let argsTypes = [];

  for (const argAST of ast.arguments) {
    const [argType, newExecContext] = yield (0, _evaluate.evaluate)(argAST, currExecContext);
    argsTypes = [...argsTypes, argType];
    currExecContext = newExecContext;
  }

  currExecContext = (0, _ExecutionContext.setCurrentThisValue)(currExecContext, calleeType.self || currExecContext.value.global);
  return yield* calleeType.function.implementation(calleeType.self || currExecContext.value.global, argsTypes, currExecContext);
};

exports.CallExpressionResolver = CallExpressionResolver;

const BinaryExpressionResolver = function* (ast, execContext) {
  const [leftType, leftExecContext] = yield (0, _evaluate.evaluate)(ast.left, execContext);
  const [rightType, rightExecContext] = yield (0, _evaluate.evaluate)(ast.right, leftExecContext);

  const binaryOperatorResolver = _operators.BinaryOperatorResolvers.get(ast.operator);

  (0, _assert.default)(binaryOperatorResolver, `Binary operator resolver for ${ast.operator} hasn't been implemented yet`);
  return (0, _tuple.tuple)(binaryOperatorResolver(leftType, rightType), rightExecContext);
}; // export const FileResolver: ASTResolver<File, Any> = (ast, execContext) => {
//   return ProgramResolver(ast.program, execContext);
// };


exports.BinaryExpressionResolver = BinaryExpressionResolver;

const ProgramResolver = function* (ast, execContext) {
  const programFunction = (0, _Function.createFunction)(ast.body, []);
  const programIter = programFunction.function.implementation(execContext.value.global, [], execContext);
  const currentEvaluationResult = (0, _evaluate.evaluateThrowableIterator)(programIter);

  if ((0, _types.isThrownValue)(currentEvaluationResult[0])) {
    const [resultAsString, resultExecContext] = yield* currentEvaluationResult[0].value.properties["toString"].function.implementation(currentEvaluationResult[0].value, [], currentEvaluationResult[1]);
    return (0, _tuple.tuple)(_types.Undefined, (0, _ExecutionContext.ExecutionContext)({ ...resultExecContext.value,
      stderr: resultAsString.value
    }));
  }

  return (0, _tuple.tuple)(_types.Undefined, currentEvaluationResult[1]);
};

exports.ProgramResolver = ProgramResolver;
const BlockStatementResolver = statementResolver(function* (ast, execContext) {
  let currExecContext = execContext;

  for (const statement of ast.body) {
    [, currExecContext] = yield (0, _evaluate.evaluate)(statement, currExecContext);
  }

  return (0, _tuple.tuple)(_types.Undefined, currExecContext);
});
exports.BlockStatementResolver = BlockStatementResolver;

const AssignmentExpressionResolver = function* (ast, execContext) {
  if (ast.left.type === "MemberExpression") {
    const [objectType, afterLeftExecContext] = yield (0, _evaluate.evaluate)(ast.left.object, execContext);
    const [rightType, afterRightExecContext] = yield (0, _evaluate.evaluate)(ast.right, afterLeftExecContext);
    objectType.properties[ast.left.property.name] = rightType;
    return (0, _tuple.tuple)(rightType, afterRightExecContext);
  } else {
    const [rightType, afterRightExecContext] = yield (0, _evaluate.evaluate)(ast.right, execContext);
    return (0, _tuple.tuple)(rightType, (0, _ExecutionContext.setVariableInScope)(afterRightExecContext, ast.left.name, rightType));
  }
};

exports.AssignmentExpressionResolver = AssignmentExpressionResolver;
const ReturnStatementResolver = statementResolver(function* (statement, execContext) {
  if ((0, _util.isNull)(statement.argument)) {
    return (0, _tuple.tuple)((0, _types.ReturnValue)(_types.Undefined), execContext);
  }

  const [argType, afterArgExecContext] = yield (0, _evaluate.evaluate)(statement.argument, execContext);
  return (0, _tuple.tuple)((0, _types.ReturnValue)(argType), afterArgExecContext);
});
exports.ReturnStatementResolver = ReturnStatementResolver;

const ThisExpressionResolver = function* (_ast, execContext) {
  return (0, _tuple.tuple)(execContext.value.thisValue, execContext);
};

exports.ThisExpressionResolver = ThisExpressionResolver;

const ObjectExpressionResolver = function* (ast, execContext) {
  let obj = {};
  let currExecContext = execContext;

  for (const property of ast.properties) {
    let propValueType;

    if (property.type === "Property") {
      if (property.shorthand) {
        [propValueType, currExecContext] = yield (0, _evaluate.evaluate)(property.key, currExecContext);
      } else {
        [propValueType, currExecContext] = yield (0, _evaluate.evaluate)(property.value, currExecContext);
      }
    }

    obj = { ...obj,
      [property.key.name]: propValueType
    };
  }

  return (0, _tuple.tuple)((0, _Object.ESObject)(obj), currExecContext);
};

exports.ObjectExpressionResolver = ObjectExpressionResolver;

const FunctionExpressionResolver = function* (ast, execContext) {
  const functionType = (0, _Function.createFunction)(ast.body.body, ast.params);
  return (0, _tuple.tuple)(functionType, ast.id ? (0, _ExecutionContext.setVariableInScope)(execContext, ast.id.name, functionType) : execContext);
};

exports.FunctionExpressionResolver = FunctionExpressionResolver;
const ExpressionStatementResolver = statementResolver(function* (statement, execContext) {
  const result = yield (0, _evaluate.evaluate)(statement.expression, execContext);
  return (0, _tuple.tuple)(_types.Undefined, result[1]);
});
exports.ExpressionStatementResolver = ExpressionStatementResolver;
const VariableDeclarationResolver = statementResolver(function* (statement, execContext) {
  let currExecContext = execContext;

  for (const declaration of statement.declarations) {
    if (declaration.init) {
      const initResult = yield (0, _evaluate.evaluate)(declaration.init, currExecContext);
      currExecContext = (0, _ExecutionContext.setVariableInScope)(initResult[1], declaration.id.name, initResult[0]);
    } else {
      currExecContext = (0, _ExecutionContext.setVariableInScope)(currExecContext, declaration.id.name, _types.Undefined);
    }
  }

  return (0, _tuple.tuple)(_types.Undefined, currExecContext);
});
exports.VariableDeclarationResolver = VariableDeclarationResolver;
const FunctionDeclarationResolver = statementResolver(function* (statement, execContext) {
  return (0, _tuple.tuple)(_types.Undefined, (0, _ExecutionContext.setVariableInScope)(execContext, statement.id.name, (0, _Function.createFunction)(statement.body.body, statement.params)));
});
exports.FunctionDeclarationResolver = FunctionDeclarationResolver;
const IfStatementResolver = statementResolver(function* (statement, prevContext) {
  const [testType, afterTestExecContext] = yield (0, _evaluate.evaluate)(statement.test, prevContext);
  const testTypeAsBoolean = (0, _ESBoolean.coerceToBoolean)(testType);

  if (testTypeAsBoolean.value === true) {
    const [, consequentExecContext] = yield (0, _evaluate.evaluate)(statement.consequent, afterTestExecContext);
    return (0, _tuple.tuple)(_types.Undefined, consequentExecContext);
  } else if (testTypeAsBoolean.value === false) {
    if (statement.alternate) {
      const [, consequentExecContext] = yield (0, _evaluate.evaluate)(statement.alternate, afterTestExecContext);
      return (0, _tuple.tuple)(_types.Undefined, consequentExecContext);
    }

    return (0, _tuple.tuple)(_types.Undefined, afterTestExecContext);
  }

  return (0, _unimplemented.unimplemented)();
});
exports.IfStatementResolver = IfStatementResolver;
const EmptyStatementResolver = statementResolver(function* (_, execContext) {
  return (0, _tuple.tuple)(_types.Undefined, execContext);
});
exports.EmptyStatementResolver = EmptyStatementResolver;

const NewExpressionResolver = function* (expression, execContext) {
  let [calleeType, newExecContext] = yield (0, _evaluate.evaluate)(expression.callee, execContext);
  let currExecContext = newExecContext;
  let argsTypes = [];

  for (const argAST of expression.arguments) {
    const [argType, newExecContext] = yield (0, _evaluate.evaluate)(argAST, execContext);
    argsTypes = [...argsTypes, argType];
    currExecContext = newExecContext;
  }

  return yield* (0, _Object.createNewObjectFromConstructor)(calleeType, argsTypes, currExecContext);
};

exports.NewExpressionResolver = NewExpressionResolver;

const LogicalExpressionResolver = function* (expression, execContext) {
  const logicalOperatorResolver = _operators.LogicalOperatorResolvers.get(expression.operator);

  (0, _assert.default)(logicalOperatorResolver, `Logical operator for ${expression.operator} has not been implemented yet`);
  return yield* logicalOperatorResolver(expression.left, expression.right, execContext);
};

exports.LogicalExpressionResolver = LogicalExpressionResolver;
const TryStatementResolver = statementResolver(function* (statement, execContext) {
  const tryBlockEvaluationResult = (0, _evaluate.evaluate)(statement.block, execContext);

  if ((0, _types.isThrownValue)(tryBlockEvaluationResult[0])) {
    const preCatchHandlerExecContext = (0, _ExecutionContext.setVariableInScope)(tryBlockEvaluationResult[1], statement.handler.param.name, tryBlockEvaluationResult[0].value);
    return (0, _evaluate.evaluate)(statement.handler.body, preCatchHandlerExecContext);
  }

  return tryBlockEvaluationResult;
});
exports.TryStatementResolver = TryStatementResolver;
const ThrowStatementResolver = statementResolver(function* (statement, execContext) {
  const [argType, afterArgExecContext] = yield (0, _evaluate.evaluate)(statement.argument, execContext);
  return (0, _tuple.tuple)((0, _types.ThrownValue)(argType), afterArgExecContext);
});
exports.ThrowStatementResolver = ThrowStatementResolver;
const DoWhileStatementResolver = statementResolver(function* (_statement, execContext) {
  return (0, _tuple.tuple)(_types.Undefined, execContext);
});
exports.DoWhileStatementResolver = DoWhileStatementResolver;

const UpdateExpressionResolver = function* (expression, execContext) {
  if (expression.argument.type === "Identifier") {
    const [argType, afterArgExecContext] = yield (0, _evaluate.evaluate)(expression.argument, execContext);
    let argTypeAfterUpdate;

    if (expression.operator === "++") {
      argTypeAfterUpdate = (0, _types.ESNumber)(argType.value + 1);
    } else {
      return (0, _unimplemented.unimplemented)();
    }

    const afterUpdateExecContext = (0, _ExecutionContext.setVariableInScope)(afterArgExecContext, expression.argument.name, argTypeAfterUpdate);
    return (0, _tuple.tuple)(argTypeAfterUpdate, afterUpdateExecContext);
  }

  return (0, _unimplemented.unimplemented)();
};

exports.UpdateExpressionResolver = UpdateExpressionResolver;

const UnaryExpressionResolver = function* (expression, execContext) {
  const [argType, afterArgExecContext] = yield (0, _evaluate.evaluate)(expression.argument, execContext);

  const unaryOperatorResolver = _operators.UnaryOperatorResolvers.get(expression.operator);

  (0, _assert.default)(unaryOperatorResolver, `Unary operator resolver for ${expression.operator} hasn't been implemented yet`);
  return unaryOperatorResolver(argType, afterArgExecContext);
};

exports.UnaryExpressionResolver = UnaryExpressionResolver;
const ASTResolvers = new Map([["Literal", LiteralResolver], ["Identifier", IdentifierResolver], ["MemberExpression", MemberExpressionResolver], ["CallExpression", CallExpressionResolver], ["BinaryExpression", BinaryExpressionResolver], ["Program", ProgramResolver], ["AssignmentExpression", AssignmentExpressionResolver], ["ReturnStatement", ReturnStatementResolver], ["ThisExpression", ThisExpressionResolver], ["ObjectExpression", ObjectExpressionResolver], ["FunctionExpression", FunctionExpressionResolver], ["ExpressionStatement", ExpressionStatementResolver], ["VariableDeclaration", VariableDeclarationResolver], ["FunctionDeclaration", FunctionDeclarationResolver], ["IfStatement", IfStatementResolver], ["EmptyStatement", EmptyStatementResolver], ["BlockStatement", BlockStatementResolver], ["NewExpression", NewExpressionResolver], ["LogicalExpression", LogicalExpressionResolver], ["TryStatement", TryStatementResolver], ["ThrowStatement", ThrowStatementResolver], ["DoWhileStatement", DoWhileStatementResolver], ["UpdateExpression", UpdateExpressionResolver], ["UnaryExpression", UnaryExpressionResolver]]);
exports.ASTResolvers = ASTResolvers;