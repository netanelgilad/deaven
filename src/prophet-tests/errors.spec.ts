/// <reference types="jest" />

import { evaluateCode, nodeInitialExecutionContext } from "../prophet";

describe("errors", () => {
  describe("should return an execContext with an stderr with an error message", () => {
    test("when throw is a top level statement", () => {
      expect(
        evaluateCode(
          `
        throw "hello"
      `,
          nodeInitialExecutionContext
        )[1].value.stderr
      ).toEqual("hello");
    });
    test("when throw is a statement inside a called function", () => {
      expect(
        evaluateCode(
          `
          function foo() {
            throw "hello"
          }
        
          foo()
      `,
          nodeInitialExecutionContext
        )[1].value.stderr
      ).toEqual("hello");
    });
  });
});
