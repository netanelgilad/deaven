import { FunctionConstructor } from "../Function/Function";
import { Math } from "../math/Math";
import { evalFn } from "../eval/eval";
import { StringConstructor } from "../string/String";
import { NumberConstructor } from "../number/Number";
import { ESBooleanConstructor } from "../boolean/ESBoolean";

export const ESInitialGlobal = {
  properties: {
    Math,
    Function: FunctionConstructor,
    eval: evalFn,
    String: StringConstructor,
    Number: NumberConstructor,
    Boolean: ESBooleanConstructor
  }
};
