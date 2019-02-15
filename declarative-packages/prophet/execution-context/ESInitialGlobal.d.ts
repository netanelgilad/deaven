export declare const ESInitialGlobal: {
    properties: {
        Math: {
            properties: {
                round: {
                    implementation: typeof import("../math/round").round;
                };
            };
        };
        Function: {
            type: string;
            properties: {
                prototype: import("../Object").TESObject;
            };
            function: {
                implementation: import("../types").FunctionImplementation;
            };
        };
        eval: {
            type: string;
            properties: {
                prototype: import("../Object").TESObject;
            };
            function: {
                implementation: import("../types").FunctionImplementation;
            };
        };
        String: any;
        Number: any;
        Boolean: {
            type: string;
            properties: {
                prototype: import("../Object").TESObject;
            };
            function: {
                implementation: import("../types").FunctionImplementation;
            };
        };
        Object: {
            type: string;
            properties: {
                prototype: import("../Object").TESObject;
            };
            function: {
                implementation: import("../types").FunctionImplementation;
            };
        };
    };
};
//# sourceMappingURL=ESInitialGlobal.d.ts.map