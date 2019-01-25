import astBundle from "@deaven/ast-bundle.macro";
import { File } from "./File";
import { Directory } from "./Directory";
import { Tuple } from "@deaven/react-atoms.core";

async function sleep(timeout: number) {
  await new Promise(resolve => setTimeout(resolve, timeout));
}

const sleepBundle = astBundle(sleep, { export: true });

export default function Project() {
  return Directory({
    name: "declarative-packages",
    children: Tuple([
      Directory({
        name: "sleep",
        children: Tuple([
          File({
            name: "index.js",
            contents: sleepBundle.compiled
          }),
          File({
            name: "index.d.ts",
            contents: sleepBundle.declaration
          }),
          File({
            name: "index.ts",
            contents: sleepBundle.source
          }),
          File({
            name: "index.d.ts.map",
            contents: sleepBundle.declarationMap
          }),
          File({
            name: "package.json",
            contents: JSON.stringify(
              {
                name: "@deaven/sleep",
                version: "1.0.0",
                description: "Promise based sleep",
                author: "Netanel Gilad <netanelgilad@gmail.com>",
                license: "MIT"
              },
              null,
              2
            )
          })
        ])
      })
    ])
  });
}
