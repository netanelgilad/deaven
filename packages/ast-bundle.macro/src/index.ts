import { createMacro, MacroFunction } from "babel-plugin-macros";
import { program, stringLiteral, Identifier, Statement } from "@babel/types";
import { NodePath } from "@babel/traverse";
import { unsafeCast } from "@deaven/unsafe-cast";

function buildAST(path: NodePath<Identifier>) {
  const pathToReturn = unsafeCast<NodePath<Statement>>(
    path.scope.bindings[path.node.name].path
  );
  const nodeToReturn = pathToReturn.node;
  pathToReturn.remove();
  return program([nodeToReturn]);
}

const astBundleMacro: MacroFunction = function myMacro({ references, babel }) {
  for (const referenceName in references) {
    for (const referencePath of references[referenceName]) {
      const targetPath = unsafeCast<NodePath<Identifier>>(
        referencePath.parentPath.get("arguments.0")
      );

      const ast = buildAST(targetPath);

      const { code } = babel.transformFromAstSync(ast)!;

      referencePath.parentPath.replaceWith(stringLiteral(code!));
    }
  }
};

export default createMacro(astBundleMacro);
