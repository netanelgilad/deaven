import {
  Any,
  GreaterThanEquals,
  TESNumber,
  isESString,
  WithValue,
  ExpressionEvaluationResult,
  isUndefined,
  isESNumber,
  ESNumber,
  isESBoolean,
  Type,
  Undefined
} from "./types";
import { ESString, TESString } from "./string/String";
import { unsafeCast } from "@deaven/unsafe-cast";
import { ESBoolean, coerceToBoolean } from "./boolean/ESBoolean";
import { TExecutionContext } from "./execution-context/ExecutionContext";
import { _ } from "@deaven/bottomdash";
import { evaluate } from "./evaluate";
import { unimplemented } from "@deaven/unimplemented";
import { tuple } from "@deaven/tuple";
import { ESTree } from "cherow";

export type BinaryOperatorResolver = (left: Any, right: Any) => Any;
export type UnaryOperatorResolver = (
  arg: Any,
  execContext: TExecutionContext
) => [Any, TExecutionContext];
export type LogicalOperatorResolver = (
  left: ESTree.Expression,
  right: ESTree.Expression,
  execContext: TExecutionContext
) => IterableIterator<[ExpressionEvaluationResult, TExecutionContext]>;

export function plus(left: Any, right: Any) {
  if (isESString(left) && typeof left.value === "string") {
    if (isESString(right)) {
      return ESString(left.value + right.value);
    }
    return ESString(left.value + "true");
  }
  return ESString([unsafeCast<TESString>(left), unsafeCast<TESString>(right)]);
}

export function minus(left: Any, right: Any) {
  if (
    isESNumber(left) &&
    typeof left.value === "number" &&
    isESNumber(right) &&
    typeof right.value === "number"
  ) {
    return ESNumber(left.value - right.value);
  }

  return unimplemented();
}

export function greaterThan(left: Any, right: Any) {
  return (
    unsafeCast<GreaterThanEquals>(left).gte >
    unsafeCast<number>(unsafeCast<TESNumber>(right).value)
  );
}

export function exactEquality(left: Any, right: Any) {
  if (isUndefined(left) && isUndefined(right)) {
    return ESBoolean(true);
  }

  if (
    isESNumber(left) &&
    typeof left.value === "number" &&
    isESNumber(right) &&
    typeof right.value === "number"
  ) {
    return ESBoolean(left.value === right.value);
  }

  return ESBoolean(
    unsafeCast<WithValue<any>>(left).id === unsafeCast<WithValue<any>>(right).id
  );
}

export function notExactEquality(left: Any, right: Any) {
  if (isUndefined(left)) {
    if (isUndefined(right)) {
      return ESBoolean(false);
    } else {
      return ESBoolean(true);
    }
  }
  if (
    isESNumber(left) &&
    typeof left.value === "number" &&
    isESNumber(right) &&
    typeof right.value === "number"
  ) {
    return ESBoolean(left.value !== right.value);
  }

  if (
    isESString(left) &&
    typeof left.value === "string" &&
    isESString(right) &&
    typeof right.value === "string"
  ) {
    return ESBoolean(left.value !== right.value);
  }

  if (
    isESBoolean(left) &&
    typeof left.value === "boolean" &&
    isESBoolean(right) &&
    typeof right.value === "boolean"
  ) {
    return ESBoolean(left.value !== right.value);
  }

  return ESBoolean(
    unsafeCast<WithValue<any>>(left).id !== unsafeCast<WithValue<any>>(right).id
  );
}

export const logicalAnd = _<LogicalOperatorResolver>(function*(
  left,
  right,
  execContext
) {
  const [leftType, afterLeftExecContext] = yield evaluate(left, execContext);
  const leftTypeAsBoolean = coerceToBoolean(leftType);
  if (leftTypeAsBoolean.value === true) {
    const [rightType, afterRightExecContext] = yield evaluate(
      right,
      afterLeftExecContext
    );
    const rightTypeAsBoolean = coerceToBoolean(rightType);
    if (rightTypeAsBoolean.value === true) {
      return [rightType, afterRightExecContext];
    }

    return unimplemented();
  } else if (leftTypeAsBoolean.value === false) {
    return [leftType, afterLeftExecContext];
  }

  return unimplemented();
});

export const logicalOr = _<LogicalOperatorResolver>(function*(
  left,
  right,
  execContext
) {
  const [leftType, afterLeftExecContext] = yield evaluate(left, execContext);
  const leftTypeAsBoolean = coerceToBoolean(leftType);
  if (leftTypeAsBoolean.value === true) {
    return [leftType, afterLeftExecContext];
  }

  return unimplemented();
});

export const equal = _<BinaryOperatorResolver>((left, right) => {
  if (
    isESBoolean(left) &&
    typeof left.value === "boolean" &&
    isESBoolean(right) &&
    typeof right.value === "boolean"
  ) {
    return ESBoolean(left.value == right.value);
  }

  return unimplemented();
});

export const notEqual = _<BinaryOperatorResolver>((left, right) => {
  return ESBoolean(
    unsafeCast<TESNumber>(left).value != unsafeCast<TESNumber>(right).value
  );
});

export const not = _<UnaryOperatorResolver>((arg, execContext) => {
  const argAsBoolean = coerceToBoolean(arg);
  if (typeof argAsBoolean.value === "boolean") {
    return tuple(ESBoolean(!argAsBoolean.value), execContext);
  }

  return unimplemented();
});

export const typeOf = _<UnaryOperatorResolver>((arg, execContext) => {
  return tuple(ESString(unsafeCast<Type<string>>(arg).type), execContext);
});

export const unaryMinus = _<UnaryOperatorResolver>((arg, execContext) => {
  return tuple(
    ESNumber(-unsafeCast<number>(unsafeCast<TESNumber>(arg).value)),
    execContext
  );
});

export const unaryVoid = _<UnaryOperatorResolver>((_, execContext) => {
  return tuple(Undefined, execContext);
});

export const BinaryOperatorResolvers = new Map<string, BinaryOperatorResolver>([
  [">", greaterThan],
  ["+", plus],
  ["-", minus],
  ["===", exactEquality],
  ["!==", notExactEquality],
  ["!=", notEqual],
  ["==", equal]
]);

export const LogicalOperatorResolvers = new Map<
  string,
  LogicalOperatorResolver
>([["&&", logicalAnd], ["||", logicalOr]]);

export const UnaryOperatorResolvers = new Map<string, UnaryOperatorResolver>([
  ["!", not],
  ["-", unaryMinus],
  ["typeof", typeOf],
  ["void", unaryVoid]
]);
