type AST = unknown;
type StringChange = {
  from: number;
  to: number;
  replacement?: string;
};

type ASTChange = {};

type StringToASTTransformer = (
  ast: AST,
  stringChanges: Array<StringChange>
) => AST;
type ASTToStringTransformer = (
  str: string,
  astChanges: Array<ASTChange>
) => string;

// const tranformAST: StringToASTTransformer = (ast: AST, stringChanges: Array<StringToASTTransformer>) => {

// }
