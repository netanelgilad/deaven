import { readFileSync } from "fs";
import { parse } from "@babel/parser";
import {
  evaluate,
  typeToConcrete,
  nodeInitialExecutionContext
} from "@deaven/prophet";

setTimeout(() => {
  const testFileCode = readFileSync(process.argv[2], "utf8");
  const type = evaluate(parse(testFileCode), nodeInitialExecutionContext);
  console.log(typeToConcrete(type));
}, 1000);
