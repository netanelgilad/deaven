import { sync } from "globby";
import { dirname, join, basename } from "path";
import { spawnSync } from "child_process";

const testFilesGlobs = ["language/types/boolean/S8.3_A1_T1.js"];

const testRoot = join(dirname(require.resolve("test262/package.json")), "test");

const testFiles = sync(testFilesGlobs.map(glob => join(testRoot, glob)));

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

function runTest262(testFile: string) {
  const test262HarnessBin = require.resolve("test262-harness/bin/run");
  const tsNodePath = require.resolve("ts-node/register");
  const hostPath = require.resolve("./test262/host");

  const result = spawnSync("node", [
    test262HarnessBin,
    "--hostType",
    "node",
    "--hostPath",
    process.execPath,
    "--hostArgs=--inspect",
    "--hostArgs=-r",
    `--hostArgs=${tsNodePath}`,
    "--hostArgs",
    hostPath,
    "--timeout",
    "99999999",
    testFile
  ]);
  expect(result.stderr.toString()).toEqual("");
  expect(result.stdout.toString()).not.toContain("FAIL");
}