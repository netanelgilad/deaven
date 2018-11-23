import { getType } from "./getType";
import { parseExpression } from "@babel/parser";
import { NotANumber, Number } from "./types";

describe("Math.round", () => {
  test("()", () => {
    expect(getType(parseExpression("Math.round()"))).toBe(NotANumber);
  });

  test("(string)", () => {
    expect(getType(parseExpression('Math.round("asd")'))).toBe(NotANumber);
  });

  test("(number)", () => {
    expect(getType(parseExpression("Math.round(3.5)"))).toEqual({
      number: 4
    });
  });
});

test("3", () => {
  expect(
    getType(
      parseExpression(
        `(prompt() + "World").split("").reverse().join("").substr(0,2)`
      )
    )
  ).toEqual({
    string: "dl"
  });
});

describe(".length", () => {
  test(`(prompt() + "World").split("")`, () => {
    expect(
      getType(parseExpression(`(prompt() + "World").split("").length`))
    ).toEqual({
      gte: 5
    });
  });
});

describe(">", () => {
  test("(greaterThanEquals, number)", () => {
    expect(
      getType(parseExpression(`(prompt() + "World").split("").length > 4`))
    ).toEqual(true);
  });
});
