import { parseExpression } from "@babel/parser";

export function validate(code: string) {
    const ast = parseExpression(code);
    return true;
}