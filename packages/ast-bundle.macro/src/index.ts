import { createMacro, MacroFunction } from "babel-plugin-macros";
import {
  program,
  stringLiteral,
  Identifier,
  Statement,
  Expression,
  expressionStatement,
  exportNamedDeclaration,
  FunctionDeclaration
} from "@babel/types";
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

function buildAST(
  path: NodePath<Identifier>,
  options: {
    export?: boolean;
  } = {}
) {
  // console.log({ a: path.scope.path.scope, b: path.node.name });
  const pathToReturn = unsafeCast<NodePath<Statement>>(
    unsafeCast<Binding>(resolveBindingInScope(path.scope, path.node.name)).path
  );
  let nodeToReturn = pathToReturn.node;
  if (options.export) {
    nodeToReturn = exportNamedDeclaration(
      unsafeCast<FunctionDeclaration>(nodeToReturn),
      []
    );
  }
  pathToReturn.remove();
  return program([nodeToReturn], [], "module");
}

const astBundleMacro: MacroFunction = function myMacro({
  references,
  babel,
  state
}) {
  for (const referenceName in references) {
    for (const referencePath of references[referenceName]) {
      const targetPath = unsafeCast<NodePath<Identifier>>(
        referencePath.parentPath.get("arguments.0")
      );

      const optionsArgumentPath = referencePath.parentPath.get("arguments.1");

      let options = undefined;

      if (optionsArgumentPath) {
        options = eval(
          babel.transformFromAstSync(
            program([
              expressionStatement(
                unsafeCast<NodePath<Expression>>(optionsArgumentPath).node
              )
            ]),
            undefined,
            {
              cwd: state.cwd,
              filename: state.filename
            }
          )!.code!
        );
      }

      const ast = buildAST(targetPath, options);

      const { code } = babel.transformFromAstSync(ast, state.file.code, {
        sourceType: "module",
        cwd: state.cwd,
        filename: state.filename
      })!;

      referencePath.parentPath.replaceWith(stringLiteral(code!));
    }
  }
};

export default createMacro(astBundleMacro);
