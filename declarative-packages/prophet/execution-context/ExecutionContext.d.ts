import { Any } from "../types";
import { TESObject } from "../Object";
export declare type TExecutionContext = {
    value: {
        thisValue: Any;
        scope: {
            [identifier: string]: Any;
        };
        global: TESObject;
        stderr: string;
    };
};
export declare function ExecutionContext(value: any): {
    type: string;
    value: any;
};
export declare function setCurrentThisValue(execContext: TExecutionContext, val: Any): TExecutionContext;
export declare function setVariableInScope(execContext: TExecutionContext, name: string, val: Any): {
    type: string;
    value: any;
};
//# sourceMappingURL=ExecutionContext.d.ts.map