import {
  evaluateCodeAsExpression,
  NotANumber,
  nodeInitialExecutionContext
} from "@deaven/prophet";

describe("Math.round", () => {
  test("()", () => {
    expect(
      evaluateCodeAsExpression("Math.round()", nodeInitialExecutionContext)[0]
    ).toBe(NotANumber);
  });

  test("(string)", () => {
    expect(
      evaluateCodeAsExpression(
        'Math.round("asd")',
        nodeInitialExecutionContext
      )[0]
    ).toBe(NotANumber);
  });

  test("(number)", () => {
    expect(
      evaluateCodeAsExpression(
        "Math.round(3.5)",
        nodeInitialExecutionContext
      )[0]
    ).toEqual({
      number: 4
    });
  });
});

test("4", () => {
  expect(
    evaluateCodeAsExpression(
      `(prompt() + "World").split("")`,
      nodeInitialExecutionContext
    )[0]
  ).toMatchInlineSnapshot(`
Object {
  "concrete": undefined,
  "properties": Object {
    "join": Object {
      "implementation": [Function],
    },
    "length": Object {
      "gte": 5,
    },
    "reverse": Object {
      "implementation": [Function],
    },
  },
  "type": "array",
  "value": Array [
    Object {
      "concrete": undefined,
      "properties": Object {
        "join": Object {
          "implementation": [Function],
        },
        "length": Object {},
        "reverse": Object {
          "implementation": [Function],
        },
      },
      "type": "array",
      "value": undefined,
    },
    Object {
      "concrete": true,
      "properties": Object {
        "join": Object {
          "implementation": [Function],
        },
        "length": Object {
          "number": 5,
        },
        "reverse": Object {
          "implementation": [Function],
        },
      },
      "type": "array",
      "value": Array [
        Object {
          "properties": Object {
            "length": Object {
              "number": 1,
            },
            "split": Object {
              "implementation": [Function],
            },
            "substr": Object {
              "implementation": [Function],
            },
            "toString": Object {
              "implementation": [Function],
            },
          },
          "type": "string",
          "value": "W",
        },
        Object {
          "properties": Object {
            "length": Object {
              "number": 1,
            },
            "split": Object {
              "implementation": [Function],
            },
            "substr": Object {
              "implementation": [Function],
            },
            "toString": Object {
              "implementation": [Function],
            },
          },
          "type": "string",
          "value": "o",
        },
        Object {
          "properties": Object {
            "length": Object {
              "number": 1,
            },
            "split": Object {
              "implementation": [Function],
            },
            "substr": Object {
              "implementation": [Function],
            },
            "toString": Object {
              "implementation": [Function],
            },
          },
          "type": "string",
          "value": "r",
        },
        Object {
          "properties": Object {
            "length": Object {
              "number": 1,
            },
            "split": Object {
              "implementation": [Function],
            },
            "substr": Object {
              "implementation": [Function],
            },
            "toString": Object {
              "implementation": [Function],
            },
          },
          "type": "string",
          "value": "l",
        },
        Object {
          "properties": Object {
            "length": Object {
              "number": 1,
            },
            "split": Object {
              "implementation": [Function],
            },
            "substr": Object {
              "implementation": [Function],
            },
            "toString": Object {
              "implementation": [Function],
            },
          },
          "type": "string",
          "value": "d",
        },
      ],
    },
  ],
}
`);
});

test("5", () => {
  expect(
    evaluateCodeAsExpression(
      `(prompt() + "World").split("").reverse()`,
      nodeInitialExecutionContext
    )[0]
  ).toMatchInlineSnapshot(`
Object {
  "concrete": undefined,
  "properties": Object {
    "join": Object {
      "implementation": [Function],
    },
    "length": Object {
      "gte": 5,
    },
    "reverse": Object {
      "implementation": [Function],
    },
  },
  "type": "array",
  "value": Array [
    Object {
      "concrete": true,
      "properties": Object {
        "join": Object {
          "implementation": [Function],
        },
        "length": Object {
          "number": 5,
        },
        "reverse": Object {
          "implementation": [Function],
        },
      },
      "type": "array",
      "value": Array [
        Object {
          "properties": Object {
            "length": Object {
              "number": 1,
            },
            "split": Object {
              "implementation": [Function],
            },
            "substr": Object {
              "implementation": [Function],
            },
            "toString": Object {
              "implementation": [Function],
            },
          },
          "type": "string",
          "value": "d",
        },
        Object {
          "properties": Object {
            "length": Object {
              "number": 1,
            },
            "split": Object {
              "implementation": [Function],
            },
            "substr": Object {
              "implementation": [Function],
            },
            "toString": Object {
              "implementation": [Function],
            },
          },
          "type": "string",
          "value": "l",
        },
        Object {
          "properties": Object {
            "length": Object {
              "number": 1,
            },
            "split": Object {
              "implementation": [Function],
            },
            "substr": Object {
              "implementation": [Function],
            },
            "toString": Object {
              "implementation": [Function],
            },
          },
          "type": "string",
          "value": "r",
        },
        Object {
          "properties": Object {
            "length": Object {
              "number": 1,
            },
            "split": Object {
              "implementation": [Function],
            },
            "substr": Object {
              "implementation": [Function],
            },
            "toString": Object {
              "implementation": [Function],
            },
          },
          "type": "string",
          "value": "o",
        },
        Object {
          "properties": Object {
            "length": Object {
              "number": 1,
            },
            "split": Object {
              "implementation": [Function],
            },
            "substr": Object {
              "implementation": [Function],
            },
            "toString": Object {
              "implementation": [Function],
            },
          },
          "type": "string",
          "value": "W",
        },
      ],
    },
    Object {
      "concrete": undefined,
      "properties": Object {
        "join": Object {
          "implementation": [Function],
        },
        "length": Object {},
        "reverse": Object {
          "implementation": [Function],
        },
      },
      "type": "array",
      "value": undefined,
    },
  ],
}
`);
});

test("6", () => {
  expect(
    evaluateCodeAsExpression(
      `(prompt() + "World").split("").reverse().join("")`,
      nodeInitialExecutionContext
    )[0]
  ).toMatchInlineSnapshot(`
Object {
  "properties": Object {
    "length": Object {
      "gte": 5,
    },
    "split": Object {
      "implementation": [Function],
    },
    "substr": Object {
      "implementation": [Function],
    },
    "toString": Object {
      "implementation": [Function],
    },
  },
  "type": "string",
  "value": Array [
    Object {
      "properties": Object {
        "length": Object {},
        "split": Object {
          "implementation": [Function],
        },
        "substr": Object {
          "implementation": [Function],
        },
        "toString": Object {
          "implementation": [Function],
        },
      },
      "type": "string",
      "value": "dlroW",
    },
    Object {
      "properties": Object {
        "length": Object {},
        "split": Object {
          "implementation": [Function],
        },
        "substr": Object {
          "implementation": [Function],
        },
        "toString": Object {
          "implementation": [Function],
        },
      },
      "type": "string",
      "value": undefined,
    },
  ],
}
`);
});

test("3", () => {
  expect(
    evaluateCodeAsExpression(
      `(prompt() + "World").split("").reverse().join("").substr(0,2)`,
      nodeInitialExecutionContext
    )[0]
  ).toMatchInlineSnapshot(`
Object {
  "properties": Object {
    "length": Object {
      "number": 2,
    },
    "split": Object {
      "implementation": [Function],
    },
    "substr": Object {
      "implementation": [Function],
    },
    "toString": Object {
      "implementation": [Function],
    },
  },
  "type": "string",
  "value": "dl",
}
`);
});

describe(".length", () => {
  test(`(prompt() + "World").split("")`, () => {
    expect(
      evaluateCodeAsExpression(
        `(prompt() + "World").split("").length`,
        nodeInitialExecutionContext
      )[0]
    ).toEqual({
      gte: 5
    });
  });
});

describe(">", () => {
  test("(greaterThanEquals, number)", () => {
    expect(
      evaluateCodeAsExpression(
        `(prompt() + "World").split("").length > 4`,
        nodeInitialExecutionContext
      )[0]
    ).toEqual(true);
  });
});
