import { readFileSync } from "fs";
import {
  nodeInitialExecutionContext,
  evaluateCode,
  CodeEvaluationError
} from "@deaven/prophet";
import { codeFrameColumns } from "@babel/code-frame";

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
  if (err instanceof CodeEvaluationError) {
    const codeFrame = codeFrameColumns(err.code, err.ast.loc!, {});
    console.log(err.stack!.split("\n").join("       "));
    console.log(codeFrame.split("\n").join("       "));
  } else {
    throw new Error(err.stack.split("\n").join("       "));
  }
}
