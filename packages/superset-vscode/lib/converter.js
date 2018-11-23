const { parse } = require("typescript-estree");
const { traverse } = require("estraverse");
const { concat, flatMap, findIndex, isEqual, filter } = require("lodash");

const START_SUPERSET = "/*ts ";
const END_SUPERSET = " ts*/";

function getTransformationsToSuperset(code) {
  const estreeAST = parse(code, {
    tokens: true,
    comment: true
  });

  return getTransformationsToSupersetFromAST(estreeAST);
}

function getTransformationsToSupersetFromAST(ast) {
  const transformations = [];
  traverse(ast, {
    enter(node, parent) {
      switch (node.type) {
        case "FunctionDeclaration":
          transformations.push.apply(
            transformations,
            transformFunctionDeclaration(node, ast.tokens)
          );
          transformations.push.apply(
            transformations,
            getTransformationsToSupersetFromAST(node.body)
          );
          this.skip();
          return;
        case "TSEnumDeclaration":
        case "TSInterfaceDeclaration":
        case "VariableDeclaration":
          if (node.type !== "VariableDeclaration" || node.kind === "type") {
            transformations.push.apply(
              transformations,
              parent.type === "ExportNamedDeclaration"
                ? locToTransformations(parent.loc)
                : locToTransformations(node.loc)
            );
            this.skip();
          }
          return;
        case "Identifier":
          if ("typeAnnotation" in node) {
            transformations.push.apply(
              transformations,
              locToTransformations(node.typeAnnotation.loc)
            );
          }
          this.skip();
          return;
        case "TSAsExpression":
          transformations.push.apply(
            transformations,
            locToTransformations({
              start: {
                line: node.typeAnnotation.loc.start.line,
                column: node.typeAnnotation.loc.start.column - 1
              },
              end: node.typeAnnotation.loc.end
            })
          );
          this.skip();
          return;
        case "TSNonNullExpression":
          transformations.push.apply(
            transformations,
            locToTransformations(getTokenLocByEnd(node.range[1], ast.tokens))
          );
          this.skip();
          return;
        case "TSTypeAssertionExpression":
          transformations.push.apply(
            transformations,
            locToTransformations({
              end: getPreviousTokenLoc(node.expression.range[0], ast.tokens)
                .end,
              start: node.typeAnnotation.loc.start
            })
          );
          this.skip();
          return;
        case "TSTypeParameterInstantiation":
          transformations.push.apply(
            transformations,
            locToTransformations(node.loc)
          );
          this.skip();
          return;
        case "TSModuleDeclaration":
          transformations.push.apply(
            transformations,
            locToTransformations(node.loc)
          );
          this.skip();
          return;
        case "ClassDeclaration":
          if (node.implements && node.implements.length > 0) {
            transformations.push.apply(
              transformations,
              locToTransformations({
                start: getPreviousTokenLoc(
                  node.implements[0].range[0],
                  ast.tokens
                ).start,
                end: node.implements[node.implements.length - 1].loc.end
              })
            );
          }
          return;
        case "ClassProperty":
          transformations.push.apply(
            transformations,
            locToTransformations({
              start: node.loc.start,
              end: !node.optional
                ? node.key.loc.end
                : getNextTokenLoc(node.key.loc, ast.tokens).end
            })
          );
          this.skip();
          return;
        case "TSParameterProperty":
          transformations.push.apply(
            transformations,
            locToTransformations(
              getPreviousTokenLoc(node.parameter.range[0], ast.tokens)
            )
          );
          return;
      }
    },
    keys: {
      TSInterfaceDeclaration: [],
      TSEnumDeclaration: [],
      TSAsExpression: [],
      TSNonNullExpression: [],
      TSTypeAssertionExpression: [],
      CallExpression: ["callee", "arguments", "typeParameters"],
      TSTypeParameterInstantiation: [],
      TSModuleDeclaration: [],
      ClassDeclaration: ["id", "superClass", "body"],
      ClassProperty: [],
      TSParameterProperty: ["parameter"]
    }
  });
  return filterUnneededTransformations(transformations, ast.tokens);
}

function transformFunctionDeclaration(node, tokens) {
  return concat(
    flatMap(node.params, param => {
      if (param.optional && "typeAnnotation" in param) {
        return locToTransformations({
          start: getPreviousTokenLoc(param.typeAnnotation.range[0], tokens)
            .start,
          end: param.typeAnnotation.loc.end
        });
      } else if (param.optional) {
        return locToTransformations(getNextTokenLoc(param.loc, tokens));
      } else if ("typeAnnotation" in param) {
        return locToTransformations(param.typeAnnotation.loc);
      }
    }),
    !node.returnType ? [] : locToTransformations(node.returnType.loc),
    !node.typeParameters ? [] : locToTransformations(node.typeParameters.loc)
  );
}

function locToTransformations(loc) {
  return [[loc.start, START_SUPERSET], [loc.end, END_SUPERSET]];
}

function getNextTokenLoc(tokenLoc, tokens) {
  const tokenIndex = findIndex(tokens, token => isEqual(token.loc, tokenLoc));
  return tokens[tokenIndex + 1].loc;
}

function getPreviousTokenLoc(nextRangeStart, tokens) {
  const tokenIndex = findIndex(
    tokens,
    token => token.range[0] === nextRangeStart
  );
  return tokens[tokenIndex - 1].loc;
}

function getTokenLocByEnd(end, tokens) {
  const tokenIndex = findIndex(tokens, token => token.range[1] === end);
  return tokens[tokenIndex].loc;
}

function filterUnneededTransformations(transformations) {
  return filter()
}

module.exports = {
  getTransformationsToSuperset,
  START_SUPERSET,
  END_SUPERSET
};
