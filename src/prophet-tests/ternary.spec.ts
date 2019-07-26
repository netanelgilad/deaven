import { evaluateCodeAsExpression } from "../prophet/evaluate";
import { nodeInitialExecutionContext } from "../prophet/execution-context/nodeInitialExecutionContext";
import { ESNumber } from "../prophet/types";
import { setVariablesInScope } from "../prophet/execution-context/ExecutionContext";

test("both branches evaluate to the same type", () => {
  expect(
    evaluateCodeAsExpression(
      `a > b ? a > b : a <= b`,
      setVariablesInScope(nodeInitialExecutionContext, {
        a: ESNumber(),
        b: ESNumber()
      })
    )
  ).toEqual(evaluateCodeAsExpression(`true`, nodeInitialExecutionContext));
});
