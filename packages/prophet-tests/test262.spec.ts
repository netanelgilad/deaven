import { sync } from "globby";
import { dirname, join, basename } from "path";
import { spawnSync } from "child_process";
import { moveSync } from "fs-extra";
import { sync as rimrafSync } from "rimraf";

const testFilesGlobs = [
  `language/statements/if/S12.5*.js`,
  "language/statements/if/if-{async,cls,const,decl,fun,gen,let,stmt}-*.js",
  "language/statements/if/labelled-fn-stmt-*.js",
  "language/statements/if/let-*-with-newline.js",
  "language/types/boolean/S8.3_A{3,1_T{1,2}}.js",
  "built-ins/Boolean/S15.6.1.1_A1_T*.js",
  "built-ins/Boolean/S15.6.1.1_A2.js",
  "built-ins/Boolean/S15.6.2.1_A1.js"
];

const testRoot = join(dirname(require.resolve("test262/package.json")), "test");

const globsWithTestRoot = testFilesGlobs.map(glob => join(testRoot, glob));

const testFiles = sync(globsWithTestRoot);

for (const testFile of testFiles) {
  const testName = basename(testFile);
  let currentDir = testFile.replace(testRoot + "/", "");
  let suite = () => {
    test(testName, () => {
      runTest262(testFile);
    });
  };
  while ((currentDir = dirname(currentDir)) !== ".") {
    const prevSuite = suite;
    const name = basename(currentDir);
    suite = () => {
      describe(name, prevSuite);
    };
  }

  suite();
}

beforeAll(() => {
  rimrafSync("./fails");
});

afterAll(() => {
  sync(globsWithTestRoot.map(x => x + "*.fail")).forEach(x =>
    moveSync(x, "./" + join("./fails", x.replace(testRoot, "")))
  );
});

function runTest262(testFile: string) {
  const test262HarnessBin = require.resolve("test262-harness/bin/run");
  const debugHostPath = require.resolve("./test262/debug-host");
  const hostPath = require.resolve("./test262/host");
  const argv = process.execArgv.join();
  const isDebug = argv.includes("inspect") || argv.includes("debug");

  const result = spawnSync(
    "node",
    [
      test262HarnessBin,
      "--hostType",
      "node",
      "--hostPath",
      process.execPath,
      "--hostArgs=--no-warnings",
      "--hostArgs=-r",
      "--hostArgs=source-map-support/register",
      "--hostArgs",
      isDebug ? debugHostPath : hostPath,
      ...(isDebug ? ["--timeout", "99999999"] : []),
      "--saveOnlyFailed",
      testFile
    ],
    {
      cwd: __dirname
    }
  );

  expect(result.stderr.toString()).toEqual("");
  expect(
    result.stdout
      .toString()
      .split("       ")
      .join("\n")
  ).not.toContain("FAIL");
}

function only(testGlob: any) {
  return {
    only: testGlob[0]
  };
}
