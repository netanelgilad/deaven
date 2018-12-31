import { evaluateCode } from "@deaven/prophet";
import { nodeInitialExecutionContext } from "@deaven/prophet/lib";

describe("errors", () => {
  describe("should return an execContext with an stdout with an error message", () => {
    test("when throw is a top level statement", () => {
      expect(
        evaluateCode(
          `
        throw "hello"
      `,
          nodeInitialExecutionContext
        )[1].value.stdout
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
        )[1].value.stdout
      ).toEqual("hello");
    });
  });
});
