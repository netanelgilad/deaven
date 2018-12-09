import { readFileSync } from "fs";
import { parse } from "@babel/parser";
import { getType, typeToConcrete } from "@deaven/prophet";

const testFileCode = readFileSync(process.argv[2], "utf8");
const type = getType(parse(testFileCode));
console.log(typeToConcrete(type));
