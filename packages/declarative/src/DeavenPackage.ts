import { Tuple } from "@deaven/react-atoms.core";
import { Directory } from "./Directory";
import { File } from "./File";
import { NamedBundle, Bundle } from "@deaven/ast-bundle.macro";

function kebabCase(str: string) {
  return str
    .replace(/([a-z])([A-Z])/g, "$1-$2")
    .replace(/[\s_]+/g, "-")
    .toLowerCase();
}

export function DeavenPackage(
  props: {
    description?: string;
    dependencies?: {
      [packageName: string]: string;
    };
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
    children: Tuple(
      props.bundle.compiled &&
        File({
          name: "index.js",
          contents: props.bundle.compiled
        }),
      props.bundle.sourceMap &&
        File({
          name: "index.js.map",
          contents: props.bundle.sourceMap
        }),
      props.bundle.declaration &&
        File({
          name: "index.d.ts",
          contents: props.bundle.declaration
        }),
      props.bundle.source &&
        File({
          name: "index.ts",
          contents: props.bundle.source
        }),
      props.bundle.declarationMap &&
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
            license: "MIT",
            dependencies: props.dependencies
          },
          null,
          2
        )
      })
    )
  });
}
