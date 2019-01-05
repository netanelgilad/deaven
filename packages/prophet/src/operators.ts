import {
  Any,
  GreaterThanEquals,
  NumberLiteral,
  isString,
  WithValue,
  ExpressionEvaluationResult
} from "./types";
import { ESString, TESString } from "./string/String";
import { unsafeCast } from "./unsafeGet";
import { ESBoolean, coerceToBoolean } from "./boolean/ESBoolean";
import { Expression } from "@babel/types";
import { TExecutionContext } from "./execution-context/ExecutionContext";
import { _ } from "@deaven/bottomdash";
import { evaluate } from "./evaluate";
import { unimplemented } from "@deaven/unimplemented";

export type BinaryOperatorResolver = (left: Any, right: Any) => Any;
export type LogicalOperatorResolver = (
  left: Expression,
  right: Expression,
  execContext: TExecutionContext
) => IterableIterator<[ExpressionEvaluationResult, TExecutionContext]>;

export function plus(left: Any, right: Any) {
  if (isString(left) && typeof left.value === "string") {
    if (isString(right)) {
      return ESString(left.value + right.value);
    }
    return ESString(left.value + "true");
  }
  return ESString([unsafeCast<TESString>(left), unsafeCast<TESString>(right)]);
}

export function greaterThan(left: Any, right: Any) {
  return (
    unsafeCast<GreaterThanEquals>(left).gte >
    unsafeCast<NumberLiteral>(right).number
  );
}

export function exactEquality(left: Any, right: Any) {
  return ESBoolean(
    unsafeCast<WithValue<any>>(left).id === unsafeCast<WithValue<any>>(right).id
  );
}

export function notExactEquality(left: Any, right: Any) {
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

export const BinaryOperatorResolvers = new Map<string, BinaryOperatorResolver>([
  [">", greaterThan],
  ["+", plus],
  ["===", exactEquality],
  ["!==", notExactEquality]
]);

export const LogicalOperatorResolvers = new Map<
  string,
  LogicalOperatorResolver
>([["&&", logicalAnd], ["||", logicalOr]]);
