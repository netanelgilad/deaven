const {
  getTransformationsToSuperset,
  START_SUPERSET,
  END_SUPERSET
} = require("./converter");

describe("FunctionDeclaration", () => {
  it("should convert type annotations on function parameters", () => {
    expect(
      getTransformationsToSuperset(
        `function foo(param1: string, param2: number) {}`
      )
    ).toEqual([
      [{ column: 19, line: 1 }, START_SUPERSET],
      [{ column: 27, line: 1 }, END_SUPERSET],
      [{ column: 35, line: 1 }, START_SUPERSET],
      [{ column: 43, line: 1 }, END_SUPERSET]
    ]);
  });

  it("should convert return type", () => {
    expect(getTransformationsToSuperset(`function foo(): string {}`)).toEqual([
      [{ line: 1, column: 14 }, START_SUPERSET],
      [{ line: 1, column: 22 }, END_SUPERSET]
    ]);
  });

  it("should convert type parameters", () => {
    expect(getTransformationsToSuperset(`function foo<T>() {}`)).toEqual([
      [{ line: 1, column: 12 }, START_SUPERSET],
      [{ line: 1, column: 15 }, END_SUPERSET]
    ]);
  });

  it("should convert optional parameters", () => {
    expect(
      getTransformationsToSuperset(`function foo(param1?, param2?) {}`)
    ).toEqual([
      [{ column: 19, line: 1 }, START_SUPERSET],
      [{ column: 20, line: 1 }, END_SUPERSET],
      [{ column: 28, line: 1 }, START_SUPERSET],
      [{ column: 29, line: 1 }, END_SUPERSET]
    ]);
  });

  it("should convert optional and parameter type annotation together", () => {
    expect(
      getTransformationsToSuperset(
        `function foo(param1?:string, param2?:number) {}`
      )
    ).toEqual([
      [{ column: 19, line: 1 }, START_SUPERSET],
      [{ column: 27, line: 1 }, END_SUPERSET],
      [{ column: 35, line: 1 }, START_SUPERSET],
      [{ column: 43, line: 1 }, END_SUPERSET]
    ]);
  });
});

describe("TSInterfaceDeclaration", () => {
  it("shuold convert exported statement", () => {
    expect(getTransformationsToSuperset(`export interface Foo {}`)).toEqual([
      [{ column: 0, line: 1 }, START_SUPERSET],
      [{ column: 23, line: 1 }, END_SUPERSET]
    ]);
  });

  it("shuold convert statement", () => {
    expect(getTransformationsToSuperset(`interface Foo {}`)).toEqual([
      [{ column: 0, line: 1 }, START_SUPERSET],
      [{ column: 16, line: 1 }, END_SUPERSET]
    ]);
  });
});

describe("TSEnumDeclaration", () => {
  it("shuold convert full statement", () => {
    expect(getTransformationsToSuperset(`enum Foo {}`)).toEqual([
      [{ column: 0, line: 1 }, START_SUPERSET],
      [{ column: 11, line: 1 }, END_SUPERSET]
    ]);
  });

  it("shuold convert exported statement", () => {
    expect(getTransformationsToSuperset(`export enum Foo {}`)).toEqual([
      [{ column: 0, line: 1 }, START_SUPERSET],
      [{ column: 18, line: 1 }, END_SUPERSET]
    ]);
  });
});

describe("TSTypeLiteral", () => {
  it("shuold convert full statement", () => {
    expect(getTransformationsToSuperset(`type Foo = {}`)).toEqual([
      [{ column: 0, line: 1 }, START_SUPERSET],
      [{ column: 13, line: 1 }, END_SUPERSET]
    ]);
  });

  it("shuold convert exported statement", () => {
    expect(getTransformationsToSuperset(`export type Foo = {}`)).toEqual([
      [{ column: 0, line: 1 }, START_SUPERSET],
      [{ column: 20, line: 1 }, END_SUPERSET]
    ]);
  });
});

test("shuold convert module statement", () => {
  expect(getTransformationsToSuperset(`module Foo {}`)).toEqual([
    [{ column: 0, line: 1 }, START_SUPERSET],
    [{ column: 13, line: 1 }, END_SUPERSET]
  ]);
});

describe("VariableDeclaration", () => {
  it("should convert all type annotations in declaration list", () => {
    expect(
      getTransformationsToSuperset(`const a: string = "hello", b: number = 2`)
    ).toEqual([
      [{ column: 7, line: 1 }, START_SUPERSET],
      [{ column: 15, line: 1 }, END_SUPERSET],
      [{ column: 28, line: 1 }, START_SUPERSET],
      [{ column: 36, line: 1 }, END_SUPERSET]
    ]);
  });
});

describe("TSAsExpression", () => {
  it("should convert as type assertion", () => {
    expect(getTransformationsToSuperset(`const a = "3" as string`)).toEqual([
      [{ column: 14, line: 1 }, START_SUPERSET],
      [{ column: 23, line: 1 }, END_SUPERSET]
    ]);
  });
});

test("should convert TSNonNullExpression", () => {
  expect(getTransformationsToSuperset(`const a = b  ! `)).toEqual([
    [{ column: 13, line: 1 }, START_SUPERSET],
    [{ column: 14, line: 1 }, END_SUPERSET]
  ]);
});

test("should convert type assertion", () => {
  expect(getTransformationsToSuperset(`const a = <string> 1`)).toEqual([
    [{ column: 10, line: 1 }, START_SUPERSET],
    [{ column: 18, line: 1 }, END_SUPERSET]
  ]);
});

test("should convert call expression type arguments", () => {
  expect(getTransformationsToSuperset(`const a = foo<G>();`)).toEqual([
    [{ column: 13, line: 1 }, START_SUPERSET],
    [{ column: 16, line: 1 }, END_SUPERSET]
  ]);
});

describe("ClassDeclaration", () => {
  it("should convert implements clause", () => {
    expect(
      getTransformationsToSuperset(`class A implements /* */ B, C {}`)
    ).toEqual([
      [{ column: 8, line: 1 }, START_SUPERSET],
      [{ column: 29, line: 1 }, END_SUPERSET]
    ]);
  });
});

describe("ClassProperty", () => {
  it("should convert class property without init", () => {
    expect(
      getTransformationsToSuperset(`class A { private static aProperty? = 3}`)
    ).toEqual([
      [{ column: 10, line: 1 }, START_SUPERSET],
      [{ column: 35, line: 1 }, END_SUPERSET]
    ]);
  });

  it("should convert constructor parameters", () => {
    expect(
      getTransformationsToSuperset(
        `class A { constructor(private prop: string) {} }`
      )
    ).toEqual([
      [{ column: 22, line: 1 }, START_SUPERSET],
      [{ column: 29, line: 1 }, END_SUPERSET],
      [{ column: 34, line: 1 }, START_SUPERSET],
      [{ column: 42, line: 1 }, END_SUPERSET]
    ]);
  });
});

test("should not convert if inside superset comment", () => {
  expect(
    getTransformationsToSuperset(
      `const a ${START_SUPERSET}: number${END_SUPERSET} = 3;`
    )
  ).toEqual([]);
});
