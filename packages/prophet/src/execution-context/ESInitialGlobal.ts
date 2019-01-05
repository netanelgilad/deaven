import { FunctionConstructor } from "../Function/Function";
import { Math } from "../math/Math";
import { evalFn } from "../eval/eval";
import { StringConstructor } from "../string/String";

export const ESInitialGlobal = {
  properties: {
    Math,
    Function: FunctionConstructor,
    eval: evalFn,
    String: StringConstructor
  }
};
