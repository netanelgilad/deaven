import { NodePath } from "@babel/traverse";

declare const plugin: unknown;
export type MacroFunction = (
  options: {
    references: { [key: string]: Array<NodePath> };
    state: unknown;
    babel: typeof import("@babel/core");
  }
) => unknown;
export default plugin;
export function createMacro(macroFn: MacroFunction): unknown;
