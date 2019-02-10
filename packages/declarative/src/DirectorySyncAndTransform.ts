import { watch } from "chokidar";
import { useEffect, useRef } from "@deaven/react-atoms.core";
import { outputFileSync, readFileSync, existsSync } from "fs-extra";
import { resolve, join, basename, dirname } from "path";
import { ModuleKind, ScriptTarget } from "typescript";
import Project from "ts-simple-ast";
import { transformSync, BabelFileResult } from "@babel/core";
import { unsafeCast } from "@deaven/unsafe-cast.macro";

function createProject() {
  return new Project({
    compilerOptions: {
      module: ModuleKind.CommonJS,
      target: ScriptTarget.ES2017,
      declaration: true,
      declarationMap: true,
      inlineSourceMap: true
    }
  });
}

function replaceExtension(path: string, newExtension: string) {
  return path.substring(0, path.lastIndexOf("ts")) + newExtension;
}

export function DirectorySyncAndTransform(props: {
  from: string;
  to: string;
  packageOrganization?: string;
  excludeSource?: boolean;
}) {
  return useRef(createProject())
    .compose(projectRef =>
      useEffect(() => {
        watch([resolve(props.from)]).on("all", (event, path: string) => {
          if (["add", "change"].includes(event)) {
            const relativeFilePath = path.replace(resolve(props.from), "");

            if (path.endsWith("dependencies.json")) {
              const packageJsonContents = {
                name:
                  (props.packageOrganization
                    ? `@${props.packageOrganization}/`
                    : "") + basename(props.from),
                version: "1.0.0",
                ...JSON.parse(readFileSync(path).toString())
              };

              outputFileSync(
                join(
                  resolve(props.to),
                  dirname(relativeFilePath),
                  "package.json"
                ),
                JSON.stringify(packageJsonContents, null, 2)
              );
            } else if (path.endsWith(".ts") && !path.endsWith(".d.ts")) {
              const absoluteTargetPath = join(
                resolve(props.to),
                relativeFilePath
              );
              const contents = readFileSync(path).toString();

              const complied = unsafeCast<BabelFileResult>(
                transformSync(contents, {
                  filename: basename(path),
                  babelrc: false,
                  plugins: ["babel-plugin-macros"],
                  presets: [
                    [
                      "@babel/preset-env",
                      {
                        targets: {
                          node: true
                        }
                      }
                    ],
                    "@babel/typescript",
                    "@babel/preset-react"
                  ]
                })
              ).code;

              if (!props.excludeSource) {
                outputFileSync(absoluteTargetPath, contents);
              }

              outputFileSync(
                replaceExtension(absoluteTargetPath, "js"),
                complied
              );

              if (existsSync(replaceExtension(path, "d.ts"))) {
                outputFileSync(
                  replaceExtension(absoluteTargetPath, "d.ts"),
                  readFileSync(replaceExtension(path, "d.ts"))
                );
              } else {
                let sourceFile = projectRef.current.getSourceFile(
                  relativeFilePath
                );

                if (!sourceFile) {
                  sourceFile = projectRef.current.createSourceFile(
                    relativeFilePath,
                    contents
                  );
                } else {
                  sourceFile.replaceText(
                    [0, sourceFile.getFullWidth()],
                    contents
                  );
                }

                const emitOutput = sourceFile.getEmitOutput().getOutputFiles();

                outputFileSync(
                  replaceExtension(absoluteTargetPath, "d.ts.map"),
                  emitOutput[1].getText()
                );

                outputFileSync(
                  replaceExtension(absoluteTargetPath, "d.ts"),
                  emitOutput[2].getText()
                );
              }
            }
          }
        });
      }, [props.from])
    )
    .render();
}
