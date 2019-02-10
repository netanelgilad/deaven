import { WithProperties, Any, WithValue, Type, FunctionBinding } from "./types";
import { TExecutionContext } from "./execution-context/ExecutionContext";
export declare type TESObject = Type<"object"> & WithProperties & WithValue<{
    [key: string]: Any;
}> & {
    type: "object";
};
export declare function ESObject(value?: {
    [key: string]: Any;
}): TESObject;
export declare function isESObject(arg: any): arg is TESObject;
export declare function createNewObjectFromConstructor(calleeType: FunctionBinding, argsTypes: Any[], execContext: TExecutionContext): IterableIterator<any>;
//# sourceMappingURL=Object.d.ts.map