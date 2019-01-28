export function foo(a: any) {
  return a.b;
}

function bar(c: any) {
  return c.d;
}

function throwsOnFirstParameterUndefined(target: any) {
  it("throws on undefined", () => {
    expect(() => target(undefined)).toThrow();
  });
}

function returnsTheValueOfAGivenPropertyOFirstParameter(
  target: any,
  propertyName: any
) {
  it(`returns the value of a property named '${propertyName}' on the first parameter`, () => {
    const value = {};
    expect(target({ [propertyName]: value })).toBe(value);
  });
}

function returnsUndefinedWhenFirstParameterNotHavingAGivenPropertyName(
  target: any,
  propertyName: any
) {
  it(`returns undefined on not having a property named '${propertyName}'`, () => {
    expect(target({})).toBeUndefined();
  });
}

describe("foo", () => {
  throwsOnFirstParameterUndefined(foo);
  returnsTheValueOfAGivenPropertyOFirstParameter(foo, "b");
  returnsUndefinedWhenFirstParameterNotHavingAGivenPropertyName(foo, "b");
});

describe("bar", () => {
  throwsOnFirstParameterUndefined(bar);
  returnsTheValueOfAGivenPropertyOFirstParameter(bar, "d");
  returnsUndefinedWhenFirstParameterNotHavingAGivenPropertyName(bar, "d");
});
