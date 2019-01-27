import astBundle, { Bundle, NamedBundle } from "@deaven/ast-bundle.macro";
import { Directory } from "./Directory";
import { Tuple } from "@deaven/react-atoms.core";
import { DeavenPackage } from "./DeavenPackage";

async function sleep(timeout: number) {
  await new Promise(resolve => setTimeout(resolve, timeout));
}

const unsafeCast = <T>(obj: any) => {
  return (obj as any) as T;
};

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
        bundle: astBundle(unsafeCast, { export: true }) as NamedBundle,
        description:
          "Cast types but with the ability to find references in fix them"
      }),
      DeavenPackage({
        bundle: astBundle(tuple, { export: true }) as NamedBundle,
        description: "Easily infer tuple types in TypeScript"
      }),
      DeavenPackage({
        name: "bottomdash",
        bundle: astBundle([_, __], { export: true }) as Bundle,
        description: "Declare type using an expression"
      })
    ])
  });
}
