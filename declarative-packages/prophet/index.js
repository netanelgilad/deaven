'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex['default'] : ex; }

require('stacktrace-js');
var index = require('./index.js');
var lodash = require('lodash');
var tuple = require('@deaven/tuple');
var cherow = require('cherow');
var bottomdash = require('@deaven/bottomdash');
var util = require('util');
var assert = _interopDefault(require('assert'));
var produce = _interopDefault(require('immer'));

const NotANumber = {};
const Number = {};
const ESNull = {
  type: "null"
};
function isESNull(arg) {
  return arg.type === "null";
}
const Undefined = {
  type: "undefined"
};
function isUndefined(arg) {
  return arg.type === "undefined";
}
function isESString(arg) {
  return arg.type === "string";
}
function isArray(arg) {
  return arg.type === "array";
}
function ESNumber(value) {
  return {
    type: "number",
    id: ValueIdentifier(),
    properties: {},
    value
  };
}
function isESNumber(arg) {
  return arg.type === "number";
}
function isFunction(arg) {
  return lodash.isObject(arg) && lodash.keys(arg).length === 1 && lodash.keys(arg)[0] === "implementation";
}
function ValueIdentifier() {
  return {};
}
function ReturnValue(value) {
  return {
    type: "ReturnValue",
    value
  };
}
function isReturnValue(arg) {
  return arg.type === "ReturnValue";
}
function ThrownValue(value) {
  return {
    type: "ThrownValue",
    value
  };
}
function isThrownValue(arg) {
  return arg.type === "ThrownValue";
}
function isESBoolean(arg) {
  return arg.type === "boolean";
}

function* reverse(self, _args, execContext) {
  return [Array(self.value.reverse().map(part => {
    if (isArray(part) && part.value) {
      return Array(part.value.reverse(), part.concrete);
    }

    return part;
  }), self.concrete), execContext];
}

function* join(self, args, execContext) {
  const reduceArray = arg => {
    if (!arg.value) {
      return ESString();
    }

    return arg.value.reduce((result, part) => {
      let stringOfCurrentPart;

      if (isArray(part)) {
        stringOfCurrentPart = reduceArray(part);
      } else {
        stringOfCurrentPart = part;
      }

      let stringToConcatTo = result;

      if (!lodash.isUndefined(stringToConcatTo.value) && !lodash.isUndefined(stringOfCurrentPart.value)) {
        stringToConcatTo.value = stringToConcatTo.value + args[0].value + stringOfCurrentPart.value;
        return result;
      } else {
        return ESString([result, stringOfCurrentPart]);
      }
    }, ESString(""));
  };

  return [reduceArray(self), execContext];
}

function Array(value, concrete) {
  return {
    type: "array",
    properties: {
      reverse: {
        implementation: reverse
      },
      join: {
        implementation: join
      },
      length: calculateLength(value, concrete)
    },
    value,
    concrete
  };
}

function calculateLength(value, concrete) {
  if (!value) {
    return Number;
  }

  if (concrete) {
    return {
      number: value.length
    };
  }

  return value.reduce((result, part) => {
    if (!result) {
      return calculateLength(part.value, part.concrete);
    } else {
      const currentPartLength = calculateLength(part.value, part.concrete);

      if (currentPartLength === Number) {
        return {
          gte: result.value
        };
      }

      return {
        gte: currentPartLength.value
      };
    }
  }, undefined);
}

function* split(self, args, execContext) {
  return [Array(self.value.map(part => {
    if (part.value) {
      return Array(part.value.split(args[0].value).map(string => ESString(string)), true);
    }

    return Array();
  })), execContext];
}

function* substr(self, args, execContext) {
  return [ESString(lodash.first(self.value).value.substr(args[0].value, args[1].value)), execContext];
}

function ExecutionContext(value) {
  return {
    type: "ExecutionContext",
    value
  };
}
function setCurrentThisValue(execContext, val) {
  return ExecutionContext({ ...execContext.value,
    thisValue: val
  });
}
function setVariableInScope(execContext, name, val) {
  return ExecutionContext({ ...execContext.value,
    scope: { ...execContext.value.scope,
      [name]: val
    }
  });
}

function ESObject(value) {
  return {
    type: "object",
    id: ValueIdentifier(),
    properties: value || {},
    value
  };
}
function isESObject(arg) {
  return arg.type === "object";
}
function* createNewObjectFromConstructor(calleeType, argsTypes, execContext) {
  const thisValue = ESObject({});
  const currExecContext = setCurrentThisValue(execContext, thisValue);
  const [, afterCallExecContext] = yield* calleeType.function.implementation(thisValue, argsTypes, currExecContext);
  return tuple.tuple(ESObject({ ...calleeType.properties.prototype.properties,
    ...afterCallExecContext.value.thisValue.value
  }), afterCallExecContext);
}

function parseECMACompliant(code) {
  return cherow.parseScript(code, {
    loc: true
  });
}

function ESFunction(implementation) {
  return {
    type: "function",
    properties: {
      prototype: ESObject()
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
  const blockStatement = parseECMACompliant(`() => {${args[0].value}}`).body[0].expression.body;
  return [createFunction(blockStatement.body, []), execContext];
});
function createFunction(statements, params) {
  return {
    type: "function",
    properties: {
      prototype: ESObject()
    },
    function: {
      implementation: function* (_self, args, execContext) {
        const atferParametersInScopeExecContext = params.reduce((prevContext, parameter, index$$1) => setVariableInScope(prevContext, parameter.name, args[index$$1]), execContext);
        let currentEvaluationResult = tuple.tuple(Undefined, atferParametersInScopeExecContext);

        for (const statement of statements) {
          currentEvaluationResult = evaluate(statement, currentEvaluationResult[1]);

          if (isReturnValue(currentEvaluationResult[0])) {
            return tuple.tuple(currentEvaluationResult[0].value, currentEvaluationResult[1]);
          } else {
            yield currentEvaluationResult;
          }
        }

        return tuple.tuple(Undefined, currentEvaluationResult[1]);
      }
    }
  };
}

function ESString(value) {
  return {
    type: "string",
    id: ValueIdentifier(),
    properties: {
      toString: {
        function: {
          implementation: function* (self, _args, execContext) {
            return [self, execContext];
          }
        }
      },
      split: {
        implementation: split
      },
      substr: {
        implementation: substr
      },
      length: calculateLength$1(value)
    },
    value
  };
}
const StringConstructor = ESFunction(function* (_self, args, execContext) {
  return [args[0], execContext];
});

function calculateLength$1(value) {
  if (!value) {
    return Number;
  }

  if (typeof value === "string") {
    return {
      number: value.length
    };
  }

  return value.reduce((result, part) => {
    if (!result) {
      return calculateLength$1(part.value);
    } else {
      return {
        gte: result.value
      };
    }
  }, undefined);
}

function ESBoolean(value) {
  return {
    type: "boolean",
    id: ValueIdentifier(),
    properties: {},
    value
  };
}
function coerceToBoolean(val) {
  if (isESBoolean(val)) {
    return val;
  }

  if (isESNumber(val)) {
    return typeof val.value === "number" ? val.value === 0 ? ESBoolean(false) : ESBoolean(true) : ESBoolean();
  }

  if (isESNull(val) || isUndefined(val)) {
    return ESBoolean(false);
  }

  if (isESString(val)) {
    return typeof val.value === "string" ? val.value === "" ? ESBoolean(false) : ESBoolean(true) : index.unimplemented();
  }

  if (isESObject(val)) {
    return ESBoolean(true);
  }

  if (isESFunction(val)) {
    return ESBoolean(true);
  }

  return index.unimplemented();
}
const ESBooleanConstructor = ESFunction(function* (_self, args, execContext) {
  return [coerceToBoolean(args[0] || Undefined), execContext];
});

function plus(left, right) {
  if (isESString(left) && typeof left.value === "string") {
    if (isESString(right)) {
      return ESString(left.value + right.value);
    }

    return ESString(left.value + "true");
  }

  return ESString([left, right]);
}
function minus(left, right) {
  if (isESNumber(left) && typeof left.value === "number" && isESNumber(right) && typeof right.value === "number") {
    return ESNumber(left.value - right.value);
  }

  return index.unimplemented();
}
function greaterThan(left, right) {
  return left.gte > right.value;
}
function exactEquality(left, right) {
  if (isUndefined(left) && isUndefined(right)) {
    return ESBoolean(true);
  }

  if (isESNumber(left) && typeof left.value === "number" && isESNumber(right) && typeof right.value === "number") {
    return ESBoolean(left.value === right.value);
  }

  return ESBoolean(left.id === right.id);
}
function notExactEquality(left, right) {
  if (isUndefined(left)) {
    if (isUndefined(right)) {
      return ESBoolean(false);
    } else {
      return ESBoolean(true);
    }
  }

  if (isESNumber(left) && typeof left.value === "number" && isESNumber(right) && typeof right.value === "number") {
    return ESBoolean(left.value !== right.value);
  }

  if (isESString(left) && typeof left.value === "string" && isESString(right) && typeof right.value === "string") {
    return ESBoolean(left.value !== right.value);
  }

  if (isESBoolean(left) && typeof left.value === "boolean" && isESBoolean(right) && typeof right.value === "boolean") {
    return ESBoolean(left.value !== right.value);
  }

  return ESBoolean(left.id !== right.id);
}
const logicalAnd = bottomdash._(function* (left, right, execContext) {
  const [leftType, afterLeftExecContext] = yield evaluate(left, execContext);
  const leftTypeAsBoolean = coerceToBoolean(leftType);

  if (leftTypeAsBoolean.value === true) {
    const [rightType, afterRightExecContext] = yield evaluate(right, afterLeftExecContext);
    const rightTypeAsBoolean = coerceToBoolean(rightType);

    if (rightTypeAsBoolean.value === true) {
      return [rightType, afterRightExecContext];
    }

    return index.unimplemented();
  } else if (leftTypeAsBoolean.value === false) {
    return [leftType, afterLeftExecContext];
  }

  return index.unimplemented();
});
const logicalOr = bottomdash._(function* (left, _right, execContext) {
  const [leftType, afterLeftExecContext] = yield evaluate(left, execContext);
  const leftTypeAsBoolean = coerceToBoolean(leftType);

  if (leftTypeAsBoolean.value === true) {
    return [leftType, afterLeftExecContext];
  }

  return index.unimplemented();
});
const equal = bottomdash._((left, right) => {
  if (isESBoolean(left) && typeof left.value === "boolean" && isESBoolean(right) && typeof right.value === "boolean") {
    return ESBoolean(left.value == right.value);
  }

  return index.unimplemented();
});
const notEqual = bottomdash._((left, right) => {
  return ESBoolean(left.value != right.value);
});
const not = bottomdash._((arg, execContext) => {
  const argAsBoolean = coerceToBoolean(arg);

  if (typeof argAsBoolean.value === "boolean") {
    return tuple.tuple(ESBoolean(!argAsBoolean.value), execContext);
  }

  return index.unimplemented();
});
const typeOf = bottomdash._((arg, execContext) => {
  return tuple.tuple(ESString(arg.type), execContext);
});
const unaryMinus = bottomdash._((arg, execContext) => {
  return tuple.tuple(ESNumber(-arg.value), execContext);
});
const unaryVoid = bottomdash._((_, execContext) => {
  return tuple.tuple(Undefined, execContext);
});
const BinaryOperatorResolvers = new Map([[">", greaterThan], ["+", plus], ["-", minus], ["===", exactEquality], ["!==", notExactEquality], ["!=", notEqual], ["==", equal]]);
const LogicalOperatorResolvers = new Map([["&&", logicalAnd], ["||", logicalOr]]);
const UnaryOperatorResolvers = new Map([["!", not], ["-", unaryMinus], ["typeof", typeOf], ["void", unaryVoid]]);

/// <reference types="node" />
const noExecutionContextResolver = fn => function* (ast, execContext) {
  return tuple.tuple(fn(ast, execContext), execContext);
};
const statementResolver = fn => function* (ast, execContext) {
  const resultIter = fn(ast, execContext);
  return evaluateThrowableIterator(resultIter);
};
const IdentifierResolver = noExecutionContextResolver((ast, execContext) => {
  const resolvedFromScope = execContext.value.scope[ast.name];
  return resolvedFromScope || execContext.value.global.properties[ast.name] || Undefined;
});
const LiteralResolver = noExecutionContextResolver(ast => {
  if (typeof ast.value === "string") {
    return ESString(ast.value);
  } else if (typeof ast.value === "number") {
    return ESNumber(ast.value);
  } else if (typeof ast.value === "boolean") {
    return ESBoolean(ast.value);
  } else if (ast.value === null) {
    return ESNull;
  }

  return index.unimplemented();
});
const MemberExpressionResolver = function* (ast, execContext) {
  const [objectType, newExecContext] = yield evaluate(ast.object, execContext);
  const propertyType = objectType.properties[ast.property.name];

  if (isFunction(propertyType)) {
    return tuple.tuple({
      self: objectType,
      function: propertyType
    }, newExecContext);
  } else {
    return tuple.tuple(propertyType, newExecContext);
  }
};
const CallExpressionResolver = function* (ast, execContext) {
  let [calleeType, newExecContext] = yield evaluate(ast.callee, execContext);
  let currExecContext = newExecContext;
  let argsTypes = [];

  for (const argAST of ast.arguments) {
    const [argType, newExecContext] = yield evaluate(argAST, currExecContext);
    argsTypes = [...argsTypes, argType];
    currExecContext = newExecContext;
  }

  currExecContext = setCurrentThisValue(currExecContext, calleeType.self || currExecContext.value.global);
  return yield* calleeType.function.implementation(calleeType.self || currExecContext.value.global, argsTypes, currExecContext);
};
const BinaryExpressionResolver = function* (ast, execContext) {
  const [leftType, leftExecContext] = yield evaluate(ast.left, execContext);
  const [rightType, rightExecContext] = yield evaluate(ast.right, leftExecContext);
  const binaryOperatorResolver = BinaryOperatorResolvers.get(ast.operator);
  assert(binaryOperatorResolver, `Binary operator resolver for ${ast.operator} hasn't been implemented yet`);
  return tuple.tuple(binaryOperatorResolver(leftType, rightType), rightExecContext);
}; // export const FileResolver: ASTResolver<File, Any> = (ast, execContext) => {
//   return ProgramResolver(ast.program, execContext);
// };

const ProgramResolver = function* (ast, execContext) {
  const programFunction = createFunction(ast.body, []);
  const programIter = programFunction.function.implementation(execContext.value.global, [], execContext);
  const currentEvaluationResult = evaluateThrowableIterator(programIter);

  if (isThrownValue(currentEvaluationResult[0])) {
    const [resultAsString, resultExecContext] = yield* currentEvaluationResult[0].value.properties["toString"].function.implementation(currentEvaluationResult[0].value, [], currentEvaluationResult[1]);
    return tuple.tuple(Undefined, ExecutionContext({ ...resultExecContext.value,
      stderr: resultAsString.value
    }));
  }

  return tuple.tuple(Undefined, currentEvaluationResult[1]);
};
const BlockStatementResolver = statementResolver(function* (ast, execContext) {
  let currExecContext = execContext;

  for (const statement of ast.body) {
    [, currExecContext] = yield evaluate(statement, currExecContext);
  }

  return tuple.tuple(Undefined, currExecContext);
});
const AssignmentExpressionResolver = function* (ast, execContext) {
  if (ast.left.type === "MemberExpression") {
    const [objectType, afterLeftExecContext] = yield evaluate(ast.left.object, execContext);
    const [rightType, afterRightExecContext] = yield evaluate(ast.right, afterLeftExecContext);
    objectType.properties[ast.left.property.name] = rightType;
    return tuple.tuple(rightType, afterRightExecContext);
  } else {
    const [rightType, afterRightExecContext] = yield evaluate(ast.right, execContext);
    return tuple.tuple(rightType, setVariableInScope(afterRightExecContext, ast.left.name, rightType));
  }
};
const ReturnStatementResolver = statementResolver(function* (statement, execContext) {
  if (util.isNull(statement.argument)) {
    return tuple.tuple(ReturnValue(Undefined), execContext);
  }

  const [argType, afterArgExecContext] = yield evaluate(statement.argument, execContext);
  return tuple.tuple(ReturnValue(argType), afterArgExecContext);
});
const ThisExpressionResolver = function* (_ast, execContext) {
  return tuple.tuple(execContext.value.thisValue, execContext);
};
const ObjectExpressionResolver = function* (ast, execContext) {
  let obj = {};
  let currExecContext = execContext;

  for (const property of ast.properties) {
    let propValueType;

    if (property.type === "Property") {
      if (property.shorthand) {
        [propValueType, currExecContext] = yield evaluate(property.key, currExecContext);
      } else {
        [propValueType, currExecContext] = yield evaluate(property.value, currExecContext);
      }
    }

    obj = { ...obj,
      [property.key.name]: propValueType
    };
  }

  return tuple.tuple(ESObject(obj), currExecContext);
};
const FunctionExpressionResolver = function* (ast, execContext) {
  const functionType = createFunction(ast.body.body, ast.params);
  return tuple.tuple(functionType, ast.id ? setVariableInScope(execContext, ast.id.name, functionType) : execContext);
};
const ExpressionStatementResolver = statementResolver(function* (statement, execContext) {
  const result = yield evaluate(statement.expression, execContext);
  return tuple.tuple(Undefined, result[1]);
});
const VariableDeclarationResolver = statementResolver(function* (statement, execContext) {
  let currExecContext = execContext;

  for (const declaration of statement.declarations) {
    if (declaration.init) {
      const initResult = yield evaluate(declaration.init, currExecContext);
      currExecContext = setVariableInScope(initResult[1], declaration.id.name, initResult[0]);
    } else {
      currExecContext = setVariableInScope(currExecContext, declaration.id.name, Undefined);
    }
  }

  return tuple.tuple(Undefined, currExecContext);
});
const FunctionDeclarationResolver = statementResolver(function* (statement, execContext) {
  return tuple.tuple(Undefined, setVariableInScope(execContext, statement.id.name, createFunction(statement.body.body, statement.params)));
});
const IfStatementResolver = statementResolver(function* (statement, prevContext) {
  const [testType, afterTestExecContext] = yield evaluate(statement.test, prevContext);
  const testTypeAsBoolean = coerceToBoolean(testType);

  if (testTypeAsBoolean.value === true) {
    const [, consequentExecContext] = yield evaluate(statement.consequent, afterTestExecContext);
    return tuple.tuple(Undefined, consequentExecContext);
  } else if (testTypeAsBoolean.value === false) {
    if (statement.alternate) {
      const [, consequentExecContext] = yield evaluate(statement.alternate, afterTestExecContext);
      return tuple.tuple(Undefined, consequentExecContext);
    }

    return tuple.tuple(Undefined, afterTestExecContext);
  }

  return index.unimplemented();
});
const EmptyStatementResolver = statementResolver(function* (_, execContext) {
  return tuple.tuple(Undefined, execContext);
});
const NewExpressionResolver = function* (expression, execContext) {
  let [calleeType, newExecContext] = yield evaluate(expression.callee, execContext);
  let currExecContext = newExecContext;
  let argsTypes = [];

  for (const argAST of expression.arguments) {
    const [argType, newExecContext] = yield evaluate(argAST, execContext);
    argsTypes = [...argsTypes, argType];
    currExecContext = newExecContext;
  }

  return yield* createNewObjectFromConstructor(calleeType, argsTypes, currExecContext);
};
const LogicalExpressionResolver = function* (expression, execContext) {
  const logicalOperatorResolver = LogicalOperatorResolvers.get(expression.operator);
  assert(logicalOperatorResolver, `Logical operator for ${expression.operator} has not been implemented yet`);
  return yield* logicalOperatorResolver(expression.left, expression.right, execContext);
};
const TryStatementResolver = statementResolver(function* (statement, execContext) {
  const tryBlockEvaluationResult = evaluate(statement.block, execContext);

  if (isThrownValue(tryBlockEvaluationResult[0])) {
    const preCatchHandlerExecContext = setVariableInScope(tryBlockEvaluationResult[1], statement.handler.param.name, tryBlockEvaluationResult[0].value);
    return evaluate(statement.handler.body, preCatchHandlerExecContext);
  }

  return tryBlockEvaluationResult;
});
const ThrowStatementResolver = statementResolver(function* (statement, execContext) {
  const [argType, afterArgExecContext] = yield evaluate(statement.argument, execContext);
  return tuple.tuple(ThrownValue(argType), afterArgExecContext);
});
const DoWhileStatementResolver = statementResolver(function* (_statement, execContext) {
  return tuple.tuple(Undefined, execContext);
});
const UpdateExpressionResolver = function* (expression, execContext) {
  if (expression.argument.type === "Identifier") {
    const [argType, afterArgExecContext] = yield evaluate(expression.argument, execContext);
    let argTypeAfterUpdate;

    if (expression.operator === "++") {
      argTypeAfterUpdate = ESNumber(argType.value + 1);
    } else {
      return index.unimplemented();
    }

    const afterUpdateExecContext = setVariableInScope(afterArgExecContext, expression.argument.name, argTypeAfterUpdate);
    return tuple.tuple(argTypeAfterUpdate, afterUpdateExecContext);
  }

  return index.unimplemented();
};
const UnaryExpressionResolver = function* (expression, execContext) {
  const [argType, afterArgExecContext] = yield evaluate(expression.argument, execContext);
  const unaryOperatorResolver = UnaryOperatorResolvers.get(expression.operator);
  assert(unaryOperatorResolver, `Unary operator resolver for ${expression.operator} hasn't been implemented yet`);
  return unaryOperatorResolver(argType, afterArgExecContext);
};
const ASTResolvers = new Map([["Literal", LiteralResolver], ["Identifier", IdentifierResolver], ["MemberExpression", MemberExpressionResolver], ["CallExpression", CallExpressionResolver], ["BinaryExpression", BinaryExpressionResolver], ["Program", ProgramResolver], ["AssignmentExpression", AssignmentExpressionResolver], ["ReturnStatement", ReturnStatementResolver], ["ThisExpression", ThisExpressionResolver], ["ObjectExpression", ObjectExpressionResolver], ["FunctionExpression", FunctionExpressionResolver], ["ExpressionStatement", ExpressionStatementResolver], ["VariableDeclaration", VariableDeclarationResolver], ["FunctionDeclaration", FunctionDeclarationResolver], ["IfStatement", IfStatementResolver], ["EmptyStatement", EmptyStatementResolver], ["BlockStatement", BlockStatementResolver], ["NewExpression", NewExpressionResolver], ["LogicalExpression", LogicalExpressionResolver], ["TryStatement", TryStatementResolver], ["ThrowStatement", ThrowStatementResolver], ["DoWhileStatement", DoWhileStatementResolver], ["UpdateExpression", UpdateExpressionResolver], ["UnaryExpression", UnaryExpressionResolver]]);

class ASTEvaluationError extends Error {
  constructor(err, ast) {
    super(err.message);
    this.ast = ast;
    this.stack = err.stack;
  }

}
class CodeEvaluationError extends ASTEvaluationError {
  constructor(astError, code) {
    super(astError, astError.ast);
    this.code = code;
    this.stack = astError.stack;
  }

}
function evaluate(ast, execContext) {
  try {
    const resolver = ASTResolvers.get(ast.type);
    assert(resolver, `Can't resolve type of ast type ${ast.type}`);
    const resultIter = resolver(ast, execContext || ExecutionContext({}));
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
    return evaluate(parseECMACompliant(code), execContext);
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
  return evaluate(cherow.parseScript(code), execContext);
}
function evaluateThrowableIterator(itr) {
  let currentEvaluationResult = itr.next();

  while (!isThrownValue(currentEvaluationResult.value[0]) && !isReturnValue(currentEvaluationResult.value[0]) && !currentEvaluationResult.done) {
    currentEvaluationResult = itr.next(currentEvaluationResult.value);
  }

  return currentEvaluationResult.value;
}

function* prompt(_sefl, _args, execContext) {
  return [ESString(), execContext];
}

function* round(_self, args, execContext) {
  if (!args[0] || isESString(args[0])) {
    return [NotANumber, execContext];
  } else {
    return [{
      number: Math.round(args[0].value)
    }, execContext];
  }
}

const Math$1 = {
  properties: {
    round: {
      implementation: round
    }
  }
};

const evalFn = ESFunction(function* (_self, args, execContext) {
  const source = args[0].value;
  const parsedSource = parseECMACompliant(source);
  const statements = parsedSource.body;
  let currentEvaluationResult = tuple.tuple(Undefined, execContext);

  for (const statement of statements.slice(0, statements.length - 1)) {
    currentEvaluationResult = yield evaluate(statement, currentEvaluationResult[1]);
  }

  const lastStatement = statements[statements.length - 1];

  if (lastStatement.type === "ExpressionStatement") {
    return evaluate(lastStatement.expression, currentEvaluationResult[1]);
  }

  return evaluate(lastStatement, currentEvaluationResult[1]);
});

const NumberConstructor = ESFunction(function* (_self, args, execContext) {
  return [args[0], execContext];
});

const ObjectConstructor = ESFunction(function* (_self, args, execContext) {
  return tuple.tuple(args[0], execContext);
});

const ESInitialGlobal = {
  properties: {
    Math: Math$1,
    Function: FunctionConstructor,
    eval: evalFn,
    String: StringConstructor,
    Number: NumberConstructor,
    Boolean: ESBooleanConstructor,
    Object: ObjectConstructor
  }
};

const SyntaxErrorConstructor = ESFunction(function* (self, args, execContext) {
  self.properties.message = args[0];
  return tuple.tuple(Undefined, execContext);
}); // @ts-ignore

SyntaxErrorConstructor.properties.prototype.properties.toString = ESFunction(function* (self, _args, execContext) {
  return tuple.tuple(self.properties.message, execContext);
});

const vm = {
  properties: {
    createContext: {
      parameters: [],
      function: {
        implementation: function* (_self, args, execContext) {
          return [args[0], execContext];
        }
      }
    },
    runInContext: {
      parameters: [],
      function: {
        implementation: function* (_self, args, execContext) {
          const evalExecContext = ExecutionContext(produce(execContext.value, draft => {
            draft.global = ESObject({ ...ESInitialGlobal.properties,
              ...args[1].properties
            });
          }));

          try {
            return evaluateCode(args[0].value, evalExecContext);
          } catch (err) {
            if (err instanceof SyntaxError) {
              const [syntaxError, afterErrorExecContext] = yield* createNewObjectFromConstructor(SyntaxErrorConstructor, [ESString(err.stack)], evalExecContext);
              return tuple.tuple(ThrownValue(syntaxError), afterErrorExecContext);
            }

            throw err;
          }
        }
      }
    }
  }
};

const NodeBuiltinModules = new Map([["vm", vm]]);

const requireFunction = {
  parameters: [],
  function: {
    implementation: function* (_self, args, exeContext) {
      return [NodeBuiltinModules.get(args[0].value), exeContext];
    }
  }
};

const nodeInitialExecutionContext = ExecutionContext({
  global: {
    properties: { ...ESInitialGlobal.properties,
      prompt: {
        parameters: [],
        function: {
          implementation: prompt
        }
      }
    }
  },
  scope: {
    require: requireFunction
  }
});

exports.evaluate = evaluate;
exports.evaluateCode = evaluateCode;
exports.evaluateCodeAsExpression = evaluateCodeAsExpression;
exports.ASTEvaluationError = ASTEvaluationError;
exports.CodeEvaluationError = CodeEvaluationError;
exports.NotANumber = NotANumber;
exports.nodeInitialExecutionContext = nodeInitialExecutionContext;
