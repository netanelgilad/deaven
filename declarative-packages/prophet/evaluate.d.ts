import { EvaluationResult, ExpressionEvaluationResult } from "./types";
import { TExecutionContext } from "./execution-context/ExecutionContext";
import { ESTree } from "cherow";
export declare class ASTEvaluationError extends Error {
    ast: ESTree.Node;
    constructor(err: Error, ast: ESTree.Node);
}
export declare class CodeEvaluationError extends ASTEvaluationError {
    code: string;
    constructor(astError: ASTEvaluationError, code: string);
}
export declare type NodeEvaluationResult<T extends ESTree.Node> = T extends ESTree.Expression ? [ExpressionEvaluationResult, TExecutionContext] : [EvaluationResult, TExecutionContext];
export declare function evaluate<T extends ESTree.Node>(ast: T, execContext: TExecutionContext): NodeEvaluationResult<T>;
export declare function evaluateCode(code: string, execContext: TExecutionContext): [any, any];
export declare function evaluateCodeAsExpression(code: string, execContext: TExecutionContext): [any, any];
export declare function evaluateThrowableIterator<T extends Iterator<[EvaluationResult, TExecutionContext]>>(itr: T): [any, any];
//# sourceMappingURL=evaluate.d.ts.map