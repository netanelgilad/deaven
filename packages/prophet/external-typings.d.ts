declare module "@babel/parser" {
  export type AST = any;
  export function parseExpression(code: string): AST;
}
