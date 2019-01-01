import { evaluateCodeAsExpression } from "@deaven/prophet";
import { nodeInitialExecutionContext } from "@deaven/prophet/lib";

describe("new operator", () => {
  test("should return the this object with the prototype in place", () => {
    expect(
      evaluateCodeAsExpression(
        `
        (function () {
          function Bar() {
            this.a = 1;
          }
          
          Bar.prototype.foo = function() {
            return 2;
          };
          
          return new Bar()
        })()
        `,
        nodeInitialExecutionContext
      )[0]
    ).toMatchInlineSnapshot(`
Object {
  "properties": Object {
    "a": Object {
      "number": 1,
    },
    "foo": Object {
      "function": Object {
        "implementation": [Function],
      },
      "properties": Object {
        "prototype": Object {
          "properties": Object {},
          "type": "object",
          "value": undefined,
        },
      },
    },
  },
  "type": "object",
  "value": Object {
    "a": Object {
      "number": 1,
    },
    "foo": Object {
      "function": Object {
        "implementation": [Function],
      },
      "properties": Object {
        "prototype": Object {
          "properties": Object {},
          "type": "object",
          "value": undefined,
        },
      },
    },
  },
}
`);
  });
});
