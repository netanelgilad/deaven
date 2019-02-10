"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.plus = plus;
exports.minus = minus;
exports.greaterThan = greaterThan;
exports.exactEquality = exactEquality;
exports.notExactEquality = notExactEquality;
exports.UnaryOperatorResolvers = exports.LogicalOperatorResolvers = exports.BinaryOperatorResolvers = exports.unaryVoid = exports.unaryMinus = exports.typeOf = exports.not = exports.notEqual = exports.equal = exports.logicalOr = exports.logicalAnd = void 0;

var _types = require("./types");

var _String = require("./string/String");

var _ESBoolean = require("./boolean/ESBoolean");

var _bottomdash = require("@deaven/bottomdash");

var _evaluate = require("./evaluate");

var _unimplemented = require("@deaven/unimplemented");

var _tuple = require("@deaven/tuple");

function plus(left, right) {
  if ((0, _types.isESString)(left) && typeof left.value === "string") {
    if ((0, _types.isESString)(right)) {
      return (0, _String.ESString)(left.value + right.value);
    }

    return (0, _String.ESString)(left.value + "true");
  }

  return (0, _String.ESString)([left, right]);
}

function minus(left, right) {
  if ((0, _types.isESNumber)(left) && typeof left.value === "number" && (0, _types.isESNumber)(right) && typeof right.value === "number") {
    return (0, _types.ESNumber)(left.value - right.value);
  }

  return (0, _unimplemented.unimplemented)();
}

function greaterThan(left, right) {
  return left.gte > right.value;
}

function exactEquality(left, right) {
  if ((0, _types.isUndefined)(left) && (0, _types.isUndefined)(right)) {
    return (0, _ESBoolean.ESBoolean)(true);
  }

  if ((0, _types.isESNumber)(left) && typeof left.value === "number" && (0, _types.isESNumber)(right) && typeof right.value === "number") {
    return (0, _ESBoolean.ESBoolean)(left.value === right.value);
  }

  return (0, _ESBoolean.ESBoolean)(left.id === right.id);
}

function notExactEquality(left, right) {
  if ((0, _types.isUndefined)(left)) {
    if ((0, _types.isUndefined)(right)) {
      return (0, _ESBoolean.ESBoolean)(false);
    } else {
      return (0, _ESBoolean.ESBoolean)(true);
    }
  }

  if ((0, _types.isESNumber)(left) && typeof left.value === "number" && (0, _types.isESNumber)(right) && typeof right.value === "number") {
    return (0, _ESBoolean.ESBoolean)(left.value !== right.value);
  }

  if ((0, _types.isESString)(left) && typeof left.value === "string" && (0, _types.isESString)(right) && typeof right.value === "string") {
    return (0, _ESBoolean.ESBoolean)(left.value !== right.value);
  }

  if ((0, _types.isESBoolean)(left) && typeof left.value === "boolean" && (0, _types.isESBoolean)(right) && typeof right.value === "boolean") {
    return (0, _ESBoolean.ESBoolean)(left.value !== right.value);
  }

  return (0, _ESBoolean.ESBoolean)(left.id !== right.id);
}

const logicalAnd = (0, _bottomdash._)(function* (left, right, execContext) {
  const [leftType, afterLeftExecContext] = yield (0, _evaluate.evaluate)(left, execContext);
  const leftTypeAsBoolean = (0, _ESBoolean.coerceToBoolean)(leftType);

  if (leftTypeAsBoolean.value === true) {
    const [rightType, afterRightExecContext] = yield (0, _evaluate.evaluate)(right, afterLeftExecContext);
    const rightTypeAsBoolean = (0, _ESBoolean.coerceToBoolean)(rightType);

    if (rightTypeAsBoolean.value === true) {
      return [rightType, afterRightExecContext];
    }

    return (0, _unimplemented.unimplemented)();
  } else if (leftTypeAsBoolean.value === false) {
    return [leftType, afterLeftExecContext];
  }

  return (0, _unimplemented.unimplemented)();
});
exports.logicalAnd = logicalAnd;
const logicalOr = (0, _bottomdash._)(function* (left, _right, execContext) {
  const [leftType, afterLeftExecContext] = yield (0, _evaluate.evaluate)(left, execContext);
  const leftTypeAsBoolean = (0, _ESBoolean.coerceToBoolean)(leftType);

  if (leftTypeAsBoolean.value === true) {
    return [leftType, afterLeftExecContext];
  }

  return (0, _unimplemented.unimplemented)();
});
exports.logicalOr = logicalOr;
const equal = (0, _bottomdash._)((left, right) => {
  if ((0, _types.isESBoolean)(left) && typeof left.value === "boolean" && (0, _types.isESBoolean)(right) && typeof right.value === "boolean") {
    return (0, _ESBoolean.ESBoolean)(left.value == right.value);
  }

  return (0, _unimplemented.unimplemented)();
});
exports.equal = equal;
const notEqual = (0, _bottomdash._)((left, right) => {
  return (0, _ESBoolean.ESBoolean)(left.value != right.value);
});
exports.notEqual = notEqual;
const not = (0, _bottomdash._)((arg, execContext) => {
  const argAsBoolean = (0, _ESBoolean.coerceToBoolean)(arg);

  if (typeof argAsBoolean.value === "boolean") {
    return (0, _tuple.tuple)((0, _ESBoolean.ESBoolean)(!argAsBoolean.value), execContext);
  }

  return (0, _unimplemented.unimplemented)();
});
exports.not = not;
const typeOf = (0, _bottomdash._)((arg, execContext) => {
  return (0, _tuple.tuple)((0, _String.ESString)(arg.type), execContext);
});
exports.typeOf = typeOf;
const unaryMinus = (0, _bottomdash._)((arg, execContext) => {
  return (0, _tuple.tuple)((0, _types.ESNumber)(-arg.value), execContext);
});
exports.unaryMinus = unaryMinus;
const unaryVoid = (0, _bottomdash._)((_, execContext) => {
  return (0, _tuple.tuple)(_types.Undefined, execContext);
});
exports.unaryVoid = unaryVoid;
const BinaryOperatorResolvers = new Map([[">", greaterThan], ["+", plus], ["-", minus], ["===", exactEquality], ["!==", notExactEquality], ["!=", notEqual], ["==", equal]]);
exports.BinaryOperatorResolvers = BinaryOperatorResolvers;
const LogicalOperatorResolvers = new Map([["&&", logicalAnd], ["||", logicalOr]]);
exports.LogicalOperatorResolvers = LogicalOperatorResolvers;
const UnaryOperatorResolvers = new Map([["!", not], ["-", unaryMinus], ["typeof", typeOf], ["void", unaryVoid]]);
exports.UnaryOperatorResolvers = UnaryOperatorResolvers;