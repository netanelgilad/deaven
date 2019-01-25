import astBundle from "@deaven/ast-bundle.macro";
import { File } from "./File";
import { Directory } from "./Directory";
import { Tuple } from "@deaven/react-atoms.core";

async function sleep(timeout: number) {
  await new Promise(resolve => setTimeout(resolve, timeout));
}

export default function Project() {
  return Directory({
    name: "declarative-packages",
    children: Tuple([
      Directory({
        name: "sleep",
        children: Tuple([
          File({
            name: "index.js",
            contents: astBundle(sleep, { export: true })
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
