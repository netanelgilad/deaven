import { sync } from "globby";
import { dirname, join, basename } from "path";
import { spawnSync } from "child_process";
import { moveSync } from "fs-extra";
import { sync as rimrafSync } from "rimraf";

const testFilesGlobs = [
  "language/types/boolean/S8.3_A1_T1.js",
  `language/statements/if/cptn-else-false-abrupt-empty.js`
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
  const tsNodePath = require.resolve("ts-node/register");
  const hostPath = require.resolve("./test262/debug-host");

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
      `--hostArgs=${tsNodePath}`,
      "--hostArgs",
      hostPath,
      "--timeout",
      "99999999",
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
