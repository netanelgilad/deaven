import { doTypesMatch } from "./doTypesMatch";
import { getType } from "./getType";
import { parseExpression } from "@babel/parser";
import { Number, String } from "./types";

test("", () => {
    expect(doTypesMatch(
        getType(
            parseExpression('Math.round(4.5)')
        ),
        Number
    )).toBeTruthy();
});

test("1", () => {
    expect(doTypesMatch(
        {
            string: "asd"
        },
        String
    )).toBeTruthy();
});

test("", () => {
    expect(doTypesMatch(
        
    ))
});
