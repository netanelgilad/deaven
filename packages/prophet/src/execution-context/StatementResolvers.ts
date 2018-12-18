import { ExpressionStatement, Statement } from "@babel/types";
import { TExecutionContext } from "./ExecutionContext";
import { evaluate } from "../evaluate";

export type StatementResolver<TStatement extends Statement> = (
  prevContext: TExecutionContext,
  statement: TStatement
) => TExecutionContext;

export const ExpressionStatementResolver: StatementResolver<
  ExpressionStatement
> = (prevContext, statement) => {
  const result = evaluate(statement.expression, prevContext);
  return result[1];
};
