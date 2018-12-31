import { TExecutionContext } from "../execution-context/ExecutionContext";
import { Type } from "../types";
import { NodeBuiltinModules } from "../node-builtin-modules/NodeBuiltInModules";
import { unsafeCast } from "../unsafeGet";
import { TString } from "../string/String";

export const requireFunction = {
  parameters: [],
  function: {
    implementation: function*(
      _self: Type,
      args: Array<Type>,
      exeContext: TExecutionContext
    ) {
      return [
        NodeBuiltinModules.get(
          unsafeCast<string>(unsafeCast<TString>(args[0]).value)
        ),
        exeContext
      ];
    }
  }
};
