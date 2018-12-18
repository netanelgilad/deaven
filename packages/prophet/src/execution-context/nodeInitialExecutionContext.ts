import { ExecutionContext } from "./ExecutionContext";
import { FunctionConstructor } from "../Function/Function";
import { Math } from "../math/Math";
import { prompt } from "../window/prompt";

export const nodeInitialExecutionContext = ExecutionContext({
  global: {
    Math,
    Function: FunctionConstructor,
    prompt
  }
});
