export type AST = unknown;
export type StringChange = {
  from: number;
  to: number;
  replacement?: string;
};

export type ASTChange = {};

export type StringToASTTransformer = (
  ast: AST,
  stringChanges: Array<StringChange>
) => AST;
export type ASTToStringTransformer = (
  str: string,
  astChanges: Array<ASTChange>
) => string;

// const tranformAST: StringToASTTransformer = (ast: AST, stringChanges: Array<StringToASTTransformer>) => {

// }
