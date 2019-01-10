import {
  isThrownValue,
  EvaluationResult,
  isReturnValue,
  ExpressionEvaluationResult
} from "./types";
import { Node, Expression } from "@babel/types";
import { ASTResolvers } from "./ASTResolvers";
import * as assert from "assert";
import {
  TExecutionContext,
  ExecutionContext
} from "./execution-context/ExecutionContext";
import { parseExpression } from "@babel/parser";
import { unsafeCast } from "./unsafeGet";
import { parseECMACompliant } from "./parseECMACompliant";

export class ASTEvaluationError extends Error {
  constructor(err: Error, public ast: Node) {
    super(err.message);
    this.stack = err.stack;
  }
}

export class CodeEvaluationError extends ASTEvaluationError {
  constructor(astError: ASTEvaluationError, public code: string) {
    super(astError, astError.ast);
    this.stack = astError.stack;
  }
}

export type NodeEvaluationResult<T extends Node> = T extends Expression
  ? [ExpressionEvaluationResult, TExecutionContext]
  : [EvaluationResult, TExecutionContext];

export function evaluate<T extends Node>(
  ast: T,
  execContext: TExecutionContext
): NodeEvaluationResult<T> {
  try {
    const resolver = ASTResolvers.get(ast.type);
    assert(resolver, `Can't resolve type of ast type ${ast.type}`);
    const resultIter = resolver!(ast, execContext || ExecutionContext({}));

    return unsafeCast<NodeEvaluationResult<T>>(
      evaluateThrowableIterator(resultIter)
    );
  } catch (err) {
    if (
      err instanceof ASTEvaluationError ||
      err instanceof CodeEvaluationError
    ) {
      throw err;
    }
    throw new ASTEvaluationError(err, ast);
  }
}

export function evaluateCode(code: string, execContext: TExecutionContext) {
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

export function evaluateCodeAsExpression(
  code: string,
  execContext: TExecutionContext
) {
  return evaluate(parseExpression(code), execContext);
}

export function evaluateThrowableIterator<
  T extends Iterator<[EvaluationResult, TExecutionContext]>
>(itr: T) {
  let currentEvaluationResult = itr.next();
  while (
    !isThrownValue(currentEvaluationResult.value[0]) &&
    !isReturnValue(currentEvaluationResult.value[0]) &&
    !currentEvaluationResult.done
  ) {
    currentEvaluationResult = itr.next(currentEvaluationResult.value);
  }

  return currentEvaluationResult.value;
}
