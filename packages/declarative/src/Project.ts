import astBundle from "@deaven/ast-bundle.macro";
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

const sleepBundle = astBundle(sleep, { export: true });
const unsafeCastBundle = astBundle(unsafeCast, { export: true });
const tupleBundle = astBundle(tuple, { export: true });

function kebabCase(str: string) {
  return str
    .replace(/([a-z])([A-Z])/g, "$1-$2")
    .replace(/[\s_]+/g, "-")
    .toLowerCase();
}

export function DeavenPackage(props: {
  bundle: {
    name: string;
    source: string;
    compiled: string;
    declaration: string;
    declarationMap: string;
  };
  description: string;
}) {
  return Directory({
    name: kebabCase(props.bundle.name),
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
            name: `@deaven/${kebabCase(props.bundle.name)}`,
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
      })
    ])
  });
}
