import astBundle, { Bundle, NamedBundle } from "@deaven/ast-bundle.macro";
import { Directory, DirectoryContext } from "./Directory";
import { Tuple, useContext } from "@deaven/react-atoms.core";
import { DeavenPackage } from "./DeavenPackage";
import { DirectorySyncAndTransform } from "./DirectorySyncAndTransform";
import { join } from "path";
import { PackagesCompiler } from "./PackagesCompiler";

async function sleep(timeout: number) {
  await new Promise(resolve => setTimeout(resolve, timeout));
}

const tuple = <T extends unknown[]>(...args: T) => args;

const _ = <T>(arg: T) => arg;
const __ = _;

export default function Project() {
  return Tuple(
    Directory({
      name: "macros-packages",
      children: useContext(DirectoryContext).render(directoryName =>
        Tuple(
          DirectorySyncAndTransform({
            from: "./src/ast-bundle.macro",
            to: join(directoryName, "ast-bundle.macro"),
            packageOrganization: "deaven",
            excludeSource: true
          }),
          DirectorySyncAndTransform({
            from: "./src/unsafe-cast.macro",
            to: join(directoryName, "unsafe-cast.macro"),
            packageOrganization: "deaven",
            excludeSource: true
          })
        )
      )
    }),
    Directory({
      name: "declarative-packages",
      children: Tuple(
        DeavenPackage({
          bundle: astBundle(sleep, { export: true }) as NamedBundle,
          description: "Promise based sleep"
        }),
        DeavenPackage({
          bundle: astBundle(tuple, { export: true }) as NamedBundle,
          description: "Easily infer tuple types in TypeScript"
        }),
        DeavenPackage({
          name: "bottomdash",
          bundle: astBundle([_, __], { export: true }) as Bundle,
          description: "Declare type using an expression"
        }),
        PackagesCompiler({
          packages: [
            {
              name: "unimplemented",
              version: "1.0.0",
              main: "./src/unimplemented/index",
              dependencies: {
                "stacktrace-js": "^2.0.0"
              }
            },
            {
              name: "prophet",
              version: "1.0.0",
              main: "./src/prophet/index",
              dependencies: {
                "@deaven/bottomdash": "^1.0.0",
                "@deaven/tuple": "^1.0.0",
                "@deaven/unimplemented": "^1.0.0",
                cherow: "1.5.4",
                immer: "^1.12.1",
                lodash: "^4.17.10"
              }
            },
            {
              name: "jest-runner-typecheck",
              version: "1.0.0",
              main: "./src/jest-runner-typecheck/index",
              dependencies: {
                "create-jest-runner": "^0.4.1"
              }
            }
          ]
        })
      )
    })
  );
}
