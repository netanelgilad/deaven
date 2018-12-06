import { getType } from "./getType";
import { parseExpression } from "@babel/parser";
import { NotANumber, Number } from "./types";

test("should throw on unknown ast type", () => {
  expect(() => getType({ type: "unknown" })).toThrowErrorMatchingInlineSnapshot(
    `"Failed to getType of ast unknown"`
  );
});

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

test("4", () => {
  expect(getType(parseExpression(`(prompt() + "World").split("")`)))
    .toMatchInlineSnapshot(`
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
  expect(getType(parseExpression(`(prompt() + "World").split("").reverse()`)))
    .toMatchInlineSnapshot(`
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
    getType(
      parseExpression(`(prompt() + "World").split("").reverse().join("")`)
    )
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
    getType(
      parseExpression(
        `(prompt() + "World").split("").reverse().join("").substr(0,2)`
      )
    )
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
  },
  "type": "string",
  "value": "dl",
}
`);
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
