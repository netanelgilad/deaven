import { readFileSync } from "fs";
import { nodeInitialExecutionContext, evaluateCode } from "@deaven/prophet";

const testFileCode = readFileSync(process.argv[2], "utf8");
try {
  const [, execContext] = evaluateCode(
    testFileCode,
    nodeInitialExecutionContext
  );
  if (execContext.value.stdout) {
    process.stdout.write(execContext.value.stdout);
  }
} catch (err) {
  throw new Error(err.stack.split("\n").join("       "));
}
