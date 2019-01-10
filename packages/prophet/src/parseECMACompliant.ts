import { parse } from "@babel/parser";
import {
  File,
  traverse,
  isIfStatement,
  isFunctionDeclaration
} from "@babel/types";

export function parseECMACompliant(code: string): File {
  const ast = parse(code);
  traverse(ast, {
    enter(path) {
      if (isIfStatement(path)) {
        if (isFunctionDeclaration(path.consequent)) {
          throw new SyntaxError();
        }
      }
    }
  });
  return ast;
}
