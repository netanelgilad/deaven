import { TExecutionContext } from "../execution-context/ExecutionContext";
export declare const vm: {
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
};
//# sourceMappingURL=vm.d.ts.map