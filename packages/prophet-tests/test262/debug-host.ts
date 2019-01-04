import { spawnSync } from "child_process";

const tsNodePath = require.resolve("ts-node/register");
const result = spawnSync("node", [
  "-r",
  tsNodePath,
  "--inspect",
  require.resolve("./host.ts"),
  process.argv[2]
]);

if (result.stdout.toString() !== "") {
  process.stdout.write(result.stdout.toString());
}

const stderr = result.stderr
  .toString()
  .replace(/Debugger[\s\S]+inspector/g, "")
  .replace(/Debugger attached./g, "")
  .replace(/Waiting for the debugger to disconnect\.\.\./, "")
  .trim();

if (stderr.toString() !== "") {
  process.stderr.write(stderr.toString());
}
