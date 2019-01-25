import webpack, { Compiler } from "webpack";
import { useEffect } from "@deaven/react-atoms.core";
import MemoryFileSystem from "memory-fs";
import Module from "module";
import { join } from "path";
import nodeExternals from "webpack-node-externals";

function watchWebpackResults(
  compiler: Compiler,
  onEvaluationResult: (result: { [file: string]: any }) => any
) {
  // Compile to in-memory file system.
  const fs = new MemoryFileSystem();
  compiler.outputFileSystem = fs;
  compiler.watch(
    {
      // Example watchOptions
      aggregateTimeout: 300,
      poll: undefined
    },
    (err, stats) => {
      if (err) {
        console.log(err);
        return;
      }
      if (stats.hasErrors()) {
        const errors = stats.compilation ? stats.compilation.errors : null;
        console.log(errors);
        return;
      }
      const { compilation } = stats;
      // Get the list of files.
      const files = Object.keys(compilation.assets);
      // Read each file and compile module
      const { outputPath } = compiler as any;
      onEvaluationResult(
        files.reduce(
          (obj, file) => {
            // Construct the module object
            // Get the code for the module.
            const path = join(outputPath, file);
            const src = fs.readFileSync(path, "utf8");

            const m = new Module(".");
            m.filename = path;
            m.paths = module.paths;
            // Compile it into a node module!
            (m as any)._compile(src, path);
            // Add the module to the object.
            obj[file] = m.exports;

            return obj;
          },
          {} as { [file: string]: any }
        )
      );
    }
  );
}

export function FileEvaluationWatcher(props: {
  path: string;
  onEvaluationResult: (result: any) => any;
}) {
  return useEffect(
    () => {
      try {
        watchWebpackResults(
          webpack({
            entry: props.path,
            target: "node",
            mode: "development",
            output: {
              libraryTarget: "commonjs2",
              path: __dirname
            },
            module: {
              rules: [
                {
                  test: /\.js$/,
                  loaders: ["babel-loader"]
                }
              ]
            },
            externals: [nodeExternals(), "./File", "./Directory"]
          }),
          files => props.onEvaluationResult(files["main.js"])
        );
      } catch (err) {
        console.log(err);
      }
    },
    [props.path]
  ).render();
}
