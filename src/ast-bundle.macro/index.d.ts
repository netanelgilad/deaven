import { Assign } from "utility-types";

export type Bundle = {
  source?: string;
  sourceMap?: string;
  compiled?: string;
  declarationMap?: string;
  declaration?: string;
};
export type NamedBundle = Assign<Bundle, { name: string }>;

declare const astBundle: (
  ast: any,
  options?: {
    export?: boolean;
  }
) => Bundle | NamedBundle;
export default astBundle;
