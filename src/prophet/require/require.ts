import { TExecutionContext } from "../execution-context/ExecutionContext";
import { Any } from "../types";
import { NodeBuiltinModules } from "../node-builtin-modules/NodeBuiltInModules";
import { unsafeCast } from "@deaven/unsafe-cast.macro";
import { TESString } from "../string/String";

export const requireFunction = {
  parameters: [],
  function: {
    implementation: function*(
      _self: Any,
      args: Array<Any>,
      exeContext: TExecutionContext
    ) {
      return [
        NodeBuiltinModules.get(
          unsafeCast<string>(unsafeCast<TESString>(args[0]).value)
        ),
        exeContext
      ];
    }
  }
};
