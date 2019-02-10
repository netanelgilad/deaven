import { TExecutionContext } from "../execution-context/ExecutionContext";
export declare const requireFunction: {
    parameters: any[];
    function: {
        implementation: (_self: any, args: any[], exeContext: TExecutionContext) => IterableIterator<(TExecutionContext | {
            properties: {
                createContext: {
                    parameters: any[];
                    function: {
                        implementation: (_self: any, args: any[], execContext: TExecutionContext) => IterableIterator<any[]>;
                    };
                };
                runInContext: {
                    parameters: any[];
                    function: {
                        implementation: (_self: any, args: any[], execContext: TExecutionContext) => IterableIterator<any>;
                    };
                };
            };
        })[]>;
    };
};
//# sourceMappingURL=require.d.ts.map