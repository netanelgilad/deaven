import { ExpressionStatement, Statement } from "@babel/types";
import { TExecutionContext, ExecutionContext } from "./ExecutionContext";
import { getType } from "../getType";
import { isArray } from "lodash";

export type StatementResolver<TStatement extends Statement> = (
  prevContext: TExecutionContext,
  statement: TStatement
) => TExecutionContext;

export const ExpressionStatementResolver: StatementResolver<
  ExpressionStatement
> = (prevContext, statement) => {
  const result = getType(statement.expression, prevContext);
  if (!isArray(result)) {
    return prevContext;
  }

  return result[1];
};
