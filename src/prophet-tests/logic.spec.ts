// /// <reference types="jest" />

test("m/in", () => {
  function min(arr: any[]) {
    return arr.length === 0
      ? undefined
      : arr.length === 1
      ? arr[0]
      : arr[0] < min(arr.slice(1))
      ? arr[0]
      : min(arr.slice(1));
  }

  const randomLength = (Math.random() * 10) / 10;

  const arr = [];
  for (let i = 0; i < randomLength; i++) {
    arr.push(Math.random());
  }

  const a = arr[1] < min(arr); // a = false

  expect(a).toBe(false);
});
