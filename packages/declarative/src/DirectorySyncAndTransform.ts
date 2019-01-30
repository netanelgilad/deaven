import { watch } from "chokidar";
import { useEffect, useRef } from "@deaven/react-atoms.core";
import { outputFileSync, readFileSync } from "fs-extra";
import { resolve, join } from "path";
import Project from "ts-simple-ast";
import { ModuleKind, ScriptTarget } from "typescript";

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

export function DirectorySyncAndTransform(props: { from: string; to: string }) {
  return useRef(createProject())
    .compose(projectRef =>
      useEffect(() => {
        watch([resolve(props.from)]).on("all", (event, path: string) => {
          if (
            ["add", "change"].includes(event) &&
            !path.endsWith("package.json")
          ) {
            const relativeFilePath = path.replace(resolve(props.from), "");
            const contents = readFileSync(path).toString();

            let sourceFile = projectRef.current.getSourceFile(relativeFilePath);
            if (!sourceFile) {
              sourceFile = projectRef.current.createSourceFile(
                relativeFilePath,
                contents
              );
            } else {
              sourceFile.replaceText([0, sourceFile.getFullWidth()], contents);
            }

            const emitOutput = sourceFile.getEmitOutput().getOutputFiles();

            outputFileSync(
              join(resolve(props.to), path.replace(resolve(props.from), "")),
              contents
            );

            outputFileSync(
              replaceExtension(
                join(resolve(props.to), path.replace(resolve(props.from), "")),
                "js"
              ),
              emitOutput[0].getText()
            );

            outputFileSync(
              replaceExtension(
                join(resolve(props.to), path.replace(resolve(props.from), "")),
                "d.ts.map"
              ),
              emitOutput[1].getText()
            );

            outputFileSync(
              replaceExtension(
                join(resolve(props.to), path.replace(resolve(props.from), "")),
                "d.ts"
              ),
              emitOutput[2].getText()
            );
          }
        });
      }, [props.from])
    )
    .render();
}
