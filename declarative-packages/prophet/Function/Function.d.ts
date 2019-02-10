import { FunctionImplementation, FunctionBinding } from "../types";
import { ESTree } from "cherow";
export declare function ESFunction(implementation: FunctionImplementation): {
    type: string;
    properties: {
        prototype: import("../Object").TESObject;
    };
    function: {
        implementation: FunctionImplementation;
    };
};
export declare function isESFunction(arg: any): arg is FunctionBinding;
export declare const FunctionConstructor: {
    type: string;
    properties: {
        prototype: import("../Object").TESObject;
    };
    function: {
        implementation: FunctionImplementation;
    };
};
export declare function createFunction(statements: ESTree.Statement[], params: Array<ESTree.Pattern>): {
    type: string;
    properties: {
        prototype: import("../Object").TESObject;
    };
    function: {
        implementation: (_self: any, args: any[], execContext: any) => IterableIterator<any>;
    };
};
//# sourceMappingURL=Function.d.ts.map