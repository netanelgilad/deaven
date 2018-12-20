import { readFileSync } from "fs";
import { parse } from "@babel/parser";
import {
  evaluate,
  typeToConcrete,
  nodeInitialExecutionContext
} from "@deaven/prophet";

setTimeout(() => {
  const testFileCode = readFileSync(process.argv[2], "utf8");
  // try {
  const type = evaluate(parse(testFileCode), nodeInitialExecutionContext);
  console.log(typeToConcrete(type));
  // } catch (err) {
  //   console.log(err.stack);
  // }
}, 1000);
