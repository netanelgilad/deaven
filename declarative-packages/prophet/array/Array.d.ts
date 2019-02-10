import { TESNumber, GreaterThanEquals } from "../types";
export declare type TArray<T> = {
    value?: Array<T> | Array<TArray<T>>;
    concrete?: boolean;
};
export declare function Array<T>(value?: Array<T> | Array<TArray<T>>, concrete?: boolean): {
    type: string;
    properties: {
        reverse: {
            implementation: any;
        };
        join: {
            implementation: any;
        };
        length: {} | TESNumber | GreaterThanEquals;
    };
    value: T[] | TArray<T>[];
    concrete: boolean;
};
//# sourceMappingURL=Array.d.ts.map