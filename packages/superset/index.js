const { createSourceFile } = require("typescript");

const a = createSourceFile(
  "a.js",
  `
    /*=
    interface Foo {
        a: number;
    }
    =*/
    const a /*= : Foo =*/ = 'a';
`,
  4
);

const b = createSourceFile(
  "a.js",
  `
    interface Foo {
        a: number;
    }
    const b: Foo  = 'b';
`,
  4
);

const a: number = 1;
console.log(a);
console.log(b);
