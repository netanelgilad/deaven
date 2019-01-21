import { createMacro, MacroFunction } from "babel-plugin-macros";
import { program, stringLiteral, Identifier, Statement } from "@babel/types";
import { NodePath, Scope, Binding } from "@babel/traverse";
import { unsafeCast } from "@deaven/unsafe-cast";

function resolveBindingInScope(
  scope: Scope,
  name: string
): Binding | undefined {
  if (name in scope.bindings) {
    return scope.bindings[name];
  }

  if (scope.parent) {
    return resolveBindingInScope(scope.parent, name);
  }
}

function buildAST(path: NodePath<Identifier>) {
  // console.log({ a: path.scope.path.scope, b: path.node.name });
  const pathToReturn = unsafeCast<NodePath<Statement>>(
    unsafeCast<Binding>(resolveBindingInScope(path.scope, path.node.name)).path
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
