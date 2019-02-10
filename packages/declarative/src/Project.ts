import astBundle, { Bundle, NamedBundle } from "@deaven/ast-bundle.macro";
import { Directory, DirectoryContext } from "./Directory";
import { Tuple, useContext } from "@deaven/react-atoms.core";
import { DeavenPackage } from "./DeavenPackage";
import { DirectorySyncAndTransform } from "./DirectorySyncAndTransform";
import { join } from "path";

async function sleep(timeout: number) {
  await new Promise(resolve => setTimeout(resolve, timeout));
}

const tuple = <T extends unknown[]>(...args: T) => args;

const _ = <T>(arg: T) => arg;
const __ = _;

export default function Project() {
  return Directory({
    name: "declarative-packages",
    children: Tuple([
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
      useContext(DirectoryContext).render(directoryName =>
        Tuple([
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
          }),
          DirectorySyncAndTransform({
            from: "./src/jest-runner-typecheck",
            to: join(directoryName, "jest-runner-typecheck")
          }),
          DirectorySyncAndTransform({
            from: "./src/unimplemented",
            to: join(directoryName, "unimplemented"),
            packageOrganization: "deaven"
          })
        ])
      )
    ])
  });
}
