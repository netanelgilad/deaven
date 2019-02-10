import { Any } from "../types";
import { TESString } from "./String";
import { TExecutionContext } from "../execution-context/ExecutionContext";
export declare function split(self: TESString, args: [TESString, ...Array<Any>], execContext: TExecutionContext): IterableIterator<(TExecutionContext | {
    type: string;
    properties: {
        reverse: {
            implementation: typeof import("../array/reverse").reverse;
        };
        join: {
            implementation: typeof import("../array/join").join;
        };
        length: {} | import("../types").GreaterThanEquals | import("../types").TESNumber;
    };
    value: {}[] | import("../array/Array").TArray<{}>[];
    concrete: boolean;
})[]>;
//# sourceMappingURL=split.d.ts.map