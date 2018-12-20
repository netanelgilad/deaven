import { ExecutionContext } from "./ExecutionContext";
import { FunctionConstructor } from "../Function/Function";
import { Math } from "../math/Math";
import { prompt } from "../window/prompt";
import { requireFunction } from "../require/require";

export const nodeInitialExecutionContext = ExecutionContext({
  global: {
    properties: {
      Math,
      Function: FunctionConstructor,
      prompt
    }
  },
  scope: {
    require: requireFunction
  }
});
