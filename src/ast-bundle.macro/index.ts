/// <reference types="node" />
import { createMacro, MacroFunction } from "babel-plugin-macros";
import {
  program,
  stringLiteral,
  Identifier,
  Expression,
  expressionStatement,
  exportNamedDeclaration,
  objectExpression,
  objectProperty,
  isVariableDeclarator,
  variableDeclaration,
  Declaration,
  isArrayExpression,
  Node,
  isIdentifier
} from "@babel/types";
import { NodePath, Scope, Binding } from "@babel/traverse";
import { unsafeCast } from "@deaven/unsafe-cast.macro";
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
function collectIdentifier(path: NodePath<Identifier>) {
  const pathToReturn = unsafeCast<NodePath<Declaration>>(
    unsafeCast<Binding>(resolveBindingInScope(path.scope, path.node.name)).path
  );

  let nodeToReturn = pathToReturn.node;

  if (isVariableDeclarator(nodeToReturn)) {
    nodeToReturn = variableDeclaration("const", [nodeToReturn]);
  }
  pathToReturn.remove();
  return nodeToReturn;
}

function buildAST(
  path: NodePath<Node>,
  options: {
    export?: boolean;
  } = {}
) {
  let programStatements: Declaration[];

  if (isArrayExpression(path.node)) {
    programStatements = unsafeCast<NodePath<Identifier>[]>(
      path.get("elements")
    ).map(identifier => collectIdentifier(identifier));
  } else if (isIdentifier(path.node)) {
    programStatements = [collectIdentifier(path as NodePath<Identifier>)];
  } else {
    throw new Error(`Unkown type of node to bundle: ${path.node.type}`);
  }

  if (options.export) {
    return program(
      programStatements.map(declaration =>
        exportNamedDeclaration(declaration, [])
      )
    );
  } else {
    return program(programStatements, [], "module");
  }
}

const astBundleMacro: MacroFunction = function myMacro({
  references,
  babel,
  state
}) {
  if (!references["default"]) {
    return;
  }

  for (const referencePath of references["default"]) {
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
      name: isIdentifier(targetPath.node) ? targetPath.node.name : undefined,
      source: code!,
      compiled: emitOutput[0].getText(),
      declarationMap: emitOutput[1].getText(),
      declaration: emitOutput[2].getText()
    };

    const result = objectExpression([
      ...(bundleOutput.name
        ? [
            objectProperty(
              stringLiteral("name"),
              stringLiteral(bundleOutput.name)
            )
          ]
        : []),
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
};

export default createMacro(astBundleMacro);
