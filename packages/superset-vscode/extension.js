// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
const { window, workspace, TextEdit, Position } = require("vscode");
const {
  createSourceFile,
  forEachChild,
  isInterfaceDeclaration,
  isBlock,
  isSourceFile,
  isTypeAliasDeclaration,
  isEnumDeclaration,
  isEmptyStatement,
  isFunctionDeclaration
} = require("typescript");
const { getTransformationsToSuperset } = require("./lib/converter");

module.exports = {
  activate
};

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
function activate(context) {
  // Use the console to output diagnostic information (console.log) and errors (console.error)
  // This line of code will only be executed once when your extension is activated
  console.log(
    'Congratulations, your extension "my-first-extension" is now active!'
  );

  context.subscriptions.push(
    workspace.onWillSaveTextDocument(async e => {
      try {
        let selections;
        const activeEditor = window.activeTextEditor;
        const activeDoc = activeEditor && activeEditor.document;
        if (activeDoc && activeDoc === e.document) {
          selections = window.activeTextEditor.selections;
        }

        const changes = getTransformationsToSuperset(e.document.getText()).map(
          result =>
            TextEdit.insert(
              new Position(result[0].line - 1, result[0].column),
              result[1]
            )
        );

        const transformations = Promise.resolve(changes);

        e.waitUntil(transformations);
        if (selections) {
          transformations.then(() => {
            activeEditor.selections = selections;
          });
        }
      } catch (err) {
        console.log(err);
      }
    })
  );
}

function isTypescriptStatement(node) {
  return (
    isInterfaceDeclaration(node) ||
    isTypeAliasDeclaration(node) ||
    isEnumDeclaration(node)
  );
}

function shouldIncludeInSupersetComment(node) {
  return isTypescriptStatement(node) || isEmptyStatement(node);
}

function getNextCandidateStatement(statements, index) {
  let currentStatement = index + 1;
  let foundStatement = false;
  while (currentStatement <= statements.length - 1 && !foundStatement) {
    foundStatement = isEmptyStatement(statements[currentStatement])
      ? false
      : statements[currentStatement];
    currentStatement++;
  }
  return foundStatement;
}

function getPreviousCandidateStatement(statements, index) {
  let currentStatement = index - 1;
  let foundStatement = false;
  while (currentStatement >= 0 && !foundStatement) {
    foundStatement = isEmptyStatement(statements[currentStatement])
      ? false
      : statements[currentStatement];
    currentStatement--;
  }
  return foundStatement;
}

function hasTypeParameters(node) {
  return isFunctionDeclaration(node);
}
