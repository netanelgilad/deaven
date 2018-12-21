import { readFileSync } from "fs";
import {
  typeToConcrete,
  nodeInitialExecutionContext,
  evaluateCode
} from "@deaven/prophet";

setTimeout(() => {
  const testFileCode = readFileSync(process.argv[2], "utf8");
  try {
    const type = evaluateCode(testFileCode, nodeInitialExecutionContext);
    console.log(typeToConcrete(type));
  } catch (err) {
    throw new Error(err.stack.split("\n").join("       "));
  }
}, 1000);
