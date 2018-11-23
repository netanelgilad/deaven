import { validate } from "./validate";

it('should valide the return value of a function', () => {
    expect(validate(`
       function foo () /* Number */ { return 'a' }
    `)).toEqual(false);
});