import { readFileSync } from "fs";
import {
  nodeInitialExecutionContext,
  evaluateCode,
  CodeEvaluationError
} from "@deaven/prophet";
import { codeFrameColumns } from "@babel/code-frame";

const argv = process.execArgv.join();
const isDebug = argv.includes("inspect") || argv.includes("debug");

function runTest() {
  const testFileCode = readFileSync(process.argv[2], "utf8");
  try {
    const [, execContext] = evaluateCode(
      testFileCode,
      nodeInitialExecutionContext
    );
    if (execContext.value.stderr) {
      process.stderr.write(execContext.value.stderr);
    }
  } catch (err) {
    if (err instanceof CodeEvaluationError) {
      const codeFrame = codeFrameColumns(err.code, err.ast.loc!, {});
      console.log(err.stack!.split("\n").join("       "));
      console.log(codeFrame.split("\n").join("       "));
    } else {
      throw new Error(err.stack.split("\n").join("       "));
    }
  }
}

isDebug ? setTimeout(runTest, 2000) : runTest();
