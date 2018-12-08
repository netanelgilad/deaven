import { readFileSync } from "fs";
import { parse } from "@babel/parser";
import { getType, typeToConcrete } from "@deaven/prophet";

console.log(
  typeToConcrete(getType(parse(readFileSync(process.argv[2], "utf8"))))
);
