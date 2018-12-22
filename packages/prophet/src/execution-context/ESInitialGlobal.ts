import { FunctionConstructor } from "../Function/Function";
import { Math } from "../math/Math";

export const ESInitialGlobal = {
  properties: {
    Math,
    Function: FunctionConstructor
  }
};
