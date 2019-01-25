import { createMacro, MacroFunction } from "babel-plugin-macros";
import {
  program,
  stringLiteral,
  Identifier,
  Statement,
  Expression,
  expressionStatement,
  exportNamedDeclaration,
  FunctionDeclaration,
  objectExpression,
  objectProperty
} from "@babel/types";
import { NodePath, Scope, Binding } from "@babel/traverse";
import { unsafeCast } from "@deaven/unsafe-cast";
import { Project, ScriptTarget } from "ts-simple-ast";
import { ModuleKind } from "typescript";

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

      const { code } = babel.transformFromAstSync(ast)!;

      const project = new Project({
        compilerOptions: {
          module: ModuleKind.CommonJS,
          target: ScriptTarget.ES2017,
          declaration: true,
          declarationMap: true,
          inlineSourceMap: true
        }
      });

      const sourceFile = project.createSourceFile("./index.ts", code!);
      const emitOutput = sourceFile.getEmitOutput().getOutputFiles();

      const bundleOutput = {
        name: targetPath.node.name,
        source: code!,
        compiled: emitOutput[0].getText(),
        declarationMap: emitOutput[1].getText(),
        declaration: emitOutput[2].getText()
      };

      const result = objectExpression([
        objectProperty(stringLiteral("name"), stringLiteral(bundleOutput.name)),
        objectProperty(
          stringLiteral("source"),
          stringLiteral(bundleOutput.source)
        ),
        objectProperty(
          stringLiteral("compiled"),
          stringLiteral(bundleOutput.compiled!)
        ),
        objectProperty(
          stringLiteral("declarationMap"),
          stringLiteral(bundleOutput.declarationMap!)
        ),
        objectProperty(
          stringLiteral("declaration"),
          stringLiteral(bundleOutput.declaration!)
        )
      ]);

      referencePath.parentPath.replaceWith(result);
    }
  }
};

export default createMacro(astBundleMacro);
