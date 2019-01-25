import { NodePath } from "@babel/traverse";

declare const plugin: unknown;
export type MacroFunction = (
  options: {
    references: { [key: string]: Array<NodePath> };
    state: {
      cwd: string;
      filename: string;
      file: {
        code: string;
      };
    };
    babel: typeof import("@babel/core");
  }
) => unknown;
export default plugin;
export function createMacro(macroFn: MacroFunction): unknown;
