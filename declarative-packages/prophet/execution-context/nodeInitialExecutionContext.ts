import { ExecutionContext } from "./ExecutionContext";
import { prompt } from "../window/prompt";
import { requireFunction } from "../require/require";
import { ESInitialGlobal } from "./ESInitialGlobal";

export const nodeInitialExecutionContext = ExecutionContext({
  global: {
    properties: {
      ...ESInitialGlobal.properties,
      prompt: {
        parameters: [],
        function: {
          implementation: prompt
        }
      }
    }
  },
  scope: {
    require: requireFunction
  }
});
