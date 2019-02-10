"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _babelPluginMacros = require("babel-plugin-macros");

const unsafeCastMacro = function myMacro({
  references
}) {
  if (references["unsafeCast"]) {
    for (const referencePath of references["unsafeCast"]) {
      const targetPath = referencePath.parentPath.get("arguments.0");
      referencePath.parentPath.replaceWith(targetPath.node);
    }
  }

  if (references["unsafeAssertExisting"]) {
    for (const referencePath of references["unsafeAssertExisting"]) {
      const targetPath = referencePath.parentPath.get("arguments.0");
      referencePath.parentPath.replaceWith(targetPath.node);
    }
  }
};

var _default = (0, _babelPluginMacros.createMacro)(unsafeCastMacro);

exports.default = _default;