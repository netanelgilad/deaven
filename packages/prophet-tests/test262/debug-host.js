const { spawnSync } = require("child_process");

const result = spawnSync("node", [
  "--inspect",
  require.resolve("./host"),
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
