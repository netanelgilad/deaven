import { WithProperties, WithValue, Type } from "../types";
export interface TESString extends Type<"string">, WithProperties, WithValue<string | Array<TESString>> {
}
export declare function ESString(value?: string | Array<TESString>): TESString;
export declare const StringConstructor: {
    type: string;
    properties: {
        prototype: import("../Object").TESObject;
    };
    function: {
        implementation: import("../types").FunctionImplementation;
    };
};
//# sourceMappingURL=String.d.ts.map