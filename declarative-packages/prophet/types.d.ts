import { TESString } from "./string/String";
import { TExecutionContext } from "./execution-context/ExecutionContext";
import { TESObject } from "./Object";
export declare const NotANumber: {};
export declare const Number: {};
export declare const TODOTYPE: {};
export declare type TESUndefined = Type<"undefined">;
export declare type TESNull = Type<"null">;
export declare const ESNull: TESNull;
export declare function isESNull(arg: any): arg is TESNull;
export declare const Undefined: TESUndefined;
export declare function isUndefined(arg: any): arg is TESUndefined;
export declare function isESString(arg: any): arg is TESString;
export declare function isArray(arg: any): boolean;
export declare type TESNumber = Type<"number"> & WithProperties & WithValue<number>;
export declare function ESNumber(value?: number): TESNumber;
export declare function isESNumber(arg: any): arg is TESNumber;
export declare type GreaterThanEquals = {
    gte: number;
};
export declare type FunctionImplementation = (self: Any, args: Array<Any>, execContext: TExecutionContext) => IterableIterator<[EvaluationResult, TExecutionContext]>;
export declare type Function = {
    implementation: FunctionImplementation;
};
export declare function isFunction(arg: any): arg is Function;
export declare type FunctionBinding = WithProperties & {
    self?: Any;
    function: Function;
};
export declare type WithProperties = {
    properties: {
        [name: string]: Any;
    };
};
export declare function ValueIdentifier(): object;
export declare type Type<T extends string> = {
    type: T;
};
export declare type TValueIdentifier = ReturnType<typeof ValueIdentifier>;
export declare type WithValue<T> = {
    id?: TValueIdentifier;
    value?: T;
};
export declare type TReturnValue = {
    type: "ReturnValue";
    value: Any;
};
export declare function ReturnValue(value: Any): {
    type: string;
    value: any;
};
export declare function isReturnValue(arg: any): arg is TReturnValue;
export declare type TThrownValue = {
    type: "ThrownValue";
    value: Any;
};
export declare function ThrownValue(value: Any): {
    type: string;
    value: any;
};
export declare function isThrownValue(arg: any): arg is TThrownValue;
export declare type TESBoolean = Type<"boolean"> & WithProperties & WithValue<boolean> & {};
export declare function isESBoolean(arg: Any): arg is TESBoolean;
export declare type Any = Type<string> | typeof NotANumber | TESString | typeof Number | TESUndefined | GreaterThanEquals | Function | TESObject | FunctionBinding | TESBoolean | TThrownValue;
export declare type ExpressionEvaluationResult = TThrownValue | Any;
export declare type ControlFlowResult = TThrownValue | TReturnValue;
export declare type EvaluationResult = Any | ControlFlowResult;
//# sourceMappingURL=types.d.ts.map