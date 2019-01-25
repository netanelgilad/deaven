import astBundle, { Bundle, NamedBundle } from "@deaven/ast-bundle.macro";
import { File } from "./File";
import { Directory } from "./Directory";
import { Tuple } from "@deaven/react-atoms.core";

async function sleep(timeout: number) {
  await new Promise(resolve => setTimeout(resolve, timeout));
}

const unsafeCast = <T>(obj: any) => {
  return (obj as any) as T;
};

const tuple = <T extends unknown[]>(...args: T) => args;

const _ = <T>(arg: T) => arg;
const __ = _;

const sleepBundle = astBundle(sleep, { export: true }) as NamedBundle;
const unsafeCastBundle = astBundle(unsafeCast, { export: true }) as NamedBundle;
const tupleBundle = astBundle(tuple, { export: true }) as NamedBundle;

const bottomdashBundle = astBundle([_, __], { export: true }) as Bundle;

function kebabCase(str: string) {
  return str
    .replace(/([a-z])([A-Z])/g, "$1-$2")
    .replace(/[\s_]+/g, "-")
    .toLowerCase();
}

export function DeavenPackage(
  props: {
    description: string;
  } & (
    | {
        bundle: NamedBundle;
      }
    | {
        bundle: Bundle;
        name: string;
      })
) {
  const packageName =
    "name" in props ? props.name : kebabCase(props.bundle.name);
  return Directory({
    name: packageName,
    children: Tuple([
      File({
        name: "index.js",
        contents: props.bundle.compiled
      }),
      File({
        name: "index.d.ts",
        contents: props.bundle.declaration
      }),
      File({
        name: "index.ts",
        contents: props.bundle.source
      }),
      File({
        name: "index.d.ts.map",
        contents: props.bundle.declarationMap
      }),
      File({
        name: "package.json",
        contents: JSON.stringify(
          {
            name: `@deaven/${packageName}`,
            version: "1.0.0",
            description: props.description,
            author: "Netanel Gilad <netanelgilad@gmail.com>",
            license: "MIT"
          },
          null,
          2
        )
      })
    ])
  });
}

export default function Project() {
  return Directory({
    name: "declarative-packages",
    children: Tuple([
      DeavenPackage({
        bundle: sleepBundle,
        description: "Promise based sleep"
      }),
      DeavenPackage({
        bundle: unsafeCastBundle,
        description:
          "Cast types but with the ability to find references in fix them"
      }),
      DeavenPackage({
        bundle: tupleBundle,
        description: "Easily infer tuple types in TypeScript"
      }),
      DeavenPackage({
        name: "bottomdash",
        bundle: bottomdashBundle,
        description: "Declare type using an expression"
      })
    ])
  });
}
