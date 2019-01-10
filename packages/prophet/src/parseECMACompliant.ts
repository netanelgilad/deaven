import { parse } from "@babel/parser";
import {
  File,
  traverse,
  isIfStatement,
  isFunctionDeclaration,
  isLabeledStatement
} from "@babel/types";

export function parseECMACompliant(code: string): File {
  const ast = parse(code);
  traverse(ast, {
    enter(path) {
      if (isIfStatement(path)) {
        if (
          isFunctionDeclaration(path.consequent) ||
          (path.alternate && isFunctionDeclaration(path.alternate)) ||
          isLabeledStatement(path.consequent) ||
          (path.alternate && isLabeledStatement(path.alternate))
        ) {
          throw new SyntaxError();
        }
      }
    }
  });
  return ast;
}
