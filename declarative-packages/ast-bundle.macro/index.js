"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _babelPluginMacros = require("babel-plugin-macros");

var _types = require("@babel/types");

var _tsSimpleAst = require("ts-simple-ast");

var _typescript = require("typescript");

/// <reference types="node" />
function resolveBindingInScope(scope, name) {
  if (name in scope.bindings) {
    return scope.bindings[name];
  }

  if (scope.parent) {
    return resolveBindingInScope(scope.parent, name);
  }
}

function collectIdentifier(path) {
  const pathToReturn = resolveBindingInScope(path.scope, path.node.name).path;
  let nodeToReturn = pathToReturn.node;

  if ((0, _types.isVariableDeclarator)(nodeToReturn)) {
    nodeToReturn = (0, _types.variableDeclaration)("const", [nodeToReturn]);
  }

  pathToReturn.remove();
  return nodeToReturn;
}

function buildAST(path, options = {}) {
  let programStatements;

  if ((0, _types.isArrayExpression)(path.node)) {
    programStatements = path.get("elements").map(identifier => collectIdentifier(identifier));
  } else if ((0, _types.isIdentifier)(path.node)) {
    programStatements = [collectIdentifier(path)];
  } else {
    throw new Error(`Unkown type of node to bundle: ${path.node.type}`);
  }

  if (options.export) {
    return (0, _types.program)(programStatements.map(declaration => (0, _types.exportNamedDeclaration)(declaration, [])));
  } else {
    return (0, _types.program)(programStatements, [], "module");
  }
}

const astBundleMacro = function myMacro({
  references,
  babel,
  state
}) {
  if (!references["default"]) {
    return;
  }

  for (const referencePath of references["default"]) {
    const targetPath = referencePath.parentPath.get("arguments.0");
    const optionsArgumentPath = referencePath.parentPath.get("arguments.1");
    let options = undefined;

    if (optionsArgumentPath) {
      options = eval(babel.transformFromAstSync((0, _types.program)([(0, _types.expressionStatement)(optionsArgumentPath.node)]), undefined, {
        cwd: state.cwd,
        filename: state.filename
      }).code);
    }

    const ast = buildAST(targetPath, options);
    const {
      code
    } = babel.transformFromAstSync(ast);
    const project = new _tsSimpleAst.Project({
      compilerOptions: {
        module: _typescript.ModuleKind.CommonJS,
        target: _tsSimpleAst.ScriptTarget.ES2017,
        declaration: true,
        declarationMap: true,
        inlineSourceMap: true
      }
    });
    const sourceFile = project.createSourceFile("./index.ts", code);
    const emitOutput = sourceFile.getEmitOutput().getOutputFiles();
    const bundleOutput = {
      name: (0, _types.isIdentifier)(targetPath.node) ? targetPath.node.name : undefined,
      source: code,
      compiled: emitOutput[0].getText(),
      declarationMap: emitOutput[1].getText(),
      declaration: emitOutput[2].getText()
    };
    const result = (0, _types.objectExpression)([...(bundleOutput.name ? [(0, _types.objectProperty)((0, _types.stringLiteral)("name"), (0, _types.stringLiteral)(bundleOutput.name))] : []), (0, _types.objectProperty)((0, _types.stringLiteral)("source"), (0, _types.stringLiteral)(bundleOutput.source)), (0, _types.objectProperty)((0, _types.stringLiteral)("compiled"), (0, _types.stringLiteral)(bundleOutput.compiled)), (0, _types.objectProperty)((0, _types.stringLiteral)("declarationMap"), (0, _types.stringLiteral)(bundleOutput.declarationMap)), (0, _types.objectProperty)((0, _types.stringLiteral)("declaration"), (0, _types.stringLiteral)(bundleOutput.declaration))]);
    referencePath.parentPath.replaceWith(result);
  }
};

var _default = (0, _babelPluginMacros.createMacro)(astBundleMacro);

exports.default = _default;