function foo(a) {
  return a.b;
}

function bar(c) {
  return c.d;
}

function throwsOnFirstParameterUndefined(target) {
  it("throws on undefined", () => {
    expect(() => target(undefined)).toThrow();
  });
}

function returnsTheValueOfAGivenPropertyOFirstParameter(target, propertyName) {
  it(`returns the value of a property named '${propertyName}' on the first parameter`, () => {
    const value = {};
    expect(target({ [propertyName]: value })).toBe(value);
  });
}

function returnsUndefinedWhenFirstParameterNotHavingAGivenPropertyName(
  target,
  propertyName
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
