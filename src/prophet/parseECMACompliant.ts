import { parseScript, ESTree } from "cherow";

export function parseECMACompliant(code: string): ESTree.Program {
  return parseScript(code, { loc: true });
}
