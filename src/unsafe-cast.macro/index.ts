import { createMacro, MacroFunction } from "babel-plugin-macros";
import { NodePath } from "@babel/traverse";

const unsafeCastMacro: MacroFunction = function myMacro({ references }) {
  if (references["unsafeCast"]) {
    for (const referencePath of references["unsafeCast"]) {
      const targetPath = referencePath.parentPath.get(
        "arguments.0"
      ) as NodePath;
      referencePath.parentPath.replaceWith(targetPath.node);
    }
  }

  if (references["unsafeAssertExisting"]) {
    for (const referencePath of references["unsafeAssertExisting"]) {
      const targetPath = referencePath.parentPath.get(
        "arguments.0"
      ) as NodePath;
      referencePath.parentPath.replaceWith(targetPath.node);
    }
  }
};

export default createMacro(unsafeCastMacro);
