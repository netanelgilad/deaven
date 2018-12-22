import {
  ExpressionStatement,
  Statement,
  VariableDeclaration,
  Identifier,
  FunctionDeclaration
} from "@babel/types";
import { TExecutionContext, setVariableInScope } from "./ExecutionContext";
import { evaluate } from "../evaluate";
import { Undefined } from "../types";
import { unsafeCast } from "../unsafeGet";
import { createFunction } from "../Function/Function";

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

export const VariableDeclarationResolver: StatementResolver<
  VariableDeclaration
> = (prevContext, statement) => {
  return statement.declarations.reduce((prevContext, declaration) => {
    if (declaration.init) {
      const [initType, afterInitContext] = evaluate(
        declaration.init,
        prevContext
      );
      return setVariableInScope(
        afterInitContext,
        unsafeCast<Identifier>(declaration.id).name,
        initType
      );
    } else {
      return setVariableInScope(
        prevContext,
        unsafeCast<Identifier>(declaration.id).name,
        Undefined
      );
    }
  }, prevContext);
};

export const FunctionDeclarationResolver: StatementResolver<
  FunctionDeclaration
> = (prevContext, statement) => {
  return setVariableInScope(
    prevContext,
    unsafeCast<Identifier>(statement.id).name,
    createFunction(statement.body, statement.params)
  );
};
