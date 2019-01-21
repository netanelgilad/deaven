////// <reference path="./external-types" />

import pluginTester from "babel-plugin-tester";
import plugin from "babel-plugin-macros";

pluginTester({
  plugin,
  snapshot: true,
  babelOptions: {
    presets: [
      [
        "@babel/preset-env",
        {
          targets: {
            node: true
          }
        }
      ],
      "@babel/typescript"
    ],
    filename: __filename
  },
  tests: [
    `
    import bundle from '@deaven/ast-bundle.macro'

    async function sleep(timeout: number) {
      await new Promise(resolve => setTimeout(resolve, timeout));
    }

    bundle(sleep)
  `,
    `
    import astBundle from "@deaven/ast-bundle.macro";
    import { ConsoleLog } from "./ConsoleLog";
    import { Tuple } from "@deaven/react-atoms.core";

    async function sleep(timeout: number) {
      await new Promise(resolve => setTimeout(resolve, timeout));
    }

    export default function Project() {
      return Tuple(
        ConsoleLog({ message: "Title 1" }),
        ConsoleLog({ message: "Hello World 15" }),
        ConsoleLog({ message: astBundle(sleep) })
      );
    }
    `
  ]
});
