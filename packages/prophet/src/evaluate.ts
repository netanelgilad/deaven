import { Type, isThrownValue, Undefined } from "./types";
import { Node } from "@babel/types";
import { ASTResolvers } from "./ASTResolvers";
import * as assert from "assert";
import {
  TExecutionContext,
  ExecutionContext
} from "./execution-context/ExecutionContext";
import { parseExpression, parse } from "@babel/parser";

export function evaluate(
  ast: Node,
  execContext: TExecutionContext
): [Type, TExecutionContext] {
  const resolver = ASTResolvers.get(ast.type);
  assert(resolver, `Can't resolve type of ast type ${ast.type}`);
  const resultIter = resolver!(ast, execContext || ExecutionContext({}));

  return evaluateThrowableIterator(resultIter);
}

export function evaluateCode(code: string, execContext: TExecutionContext) {
  return evaluate(parse(code), execContext);
}

export function evaluateCodeAsExpression(
  code: string,
  execContext: TExecutionContext
) {
  return evaluate(parseExpression(code), execContext);
}

export function evaluateThrowableIterator(
  itr: Iterator<[Type, TExecutionContext]>
) {
  let currentEvaluationResult = itr.next();
  while (
    !isThrownValue(currentEvaluationResult.value[0]) &&
    !currentEvaluationResult.done
  ) {
    currentEvaluationResult = itr.next(currentEvaluationResult.value);
  }

  return currentEvaluationResult.value;
}
