import { MemberExpression } from "@babel/types";
import { evaluate } from "../evaluate";
import { TExecutionContext } from "../execution-context/ExecutionContext";

export function resolveReference(
  ast: MemberExpression,
  execContext: TExecutionContext
) {
  const objectType = evaluate(ast.object, execContext);
  console.log(objectType);
}
