import { rollup, OutputChunk, RollupOutput, RollupCache } from "rollup";
import babel from "rollup-plugin-babel";
import nodeResolve from "rollup-plugin-node-resolve";
import { useEffect, useState, Tuple } from "@deaven/react-atoms.core";
import { resolve } from "path";
import Watchpack from "watchpack";
import { DeavenPackage } from "./DeavenPackage";

const extensions = [".ts", ".js"];

export type PackageDefinition = {
  name: string;
  description?: string;
  main: string;
  version: string;
  dependencies: {
    [packageName: string]: string;
  };
};

export function PackagesCompiler(props: {
  packages: Array<PackageDefinition>;
}) {
  return useState(undefined)
    .compose((_, setPackagesDirectories) =>
      useEffect(() => {
        (async () => {
          let { generatedBundle, watchFiles, cache } = await compilePackages(
            props.packages
          );
          const packagesDirectories = await getPackageDirectories(
            props.packages,
            generatedBundle
          );

          setPackagesDirectories(packagesDirectories);

          const watcher = new Watchpack({
            aggregateTimeout: 300
          });

          watcher.on("aggregated", async () => {
            const compilationResult = await compilePackages(
              props.packages,
              cache
            );
            cache = compilationResult.cache;
            const packagesDirectories = await getPackageDirectories(
              props.packages,
              compilationResult.generatedBundle
            );

            watcher.watch(compilationResult.watchFiles, [], Date.now());

            setPackagesDirectories(packagesDirectories);
          });

          watcher.watch(watchFiles, [], Date.now());

          return () => {
            watcher.close();
          };
        })();
      }, [props.packages])
    )
    .render(packagesDirectories =>
      packagesDirectories
        ? Tuple(
            ...packagesDirectories.map((packageDirectory: any) =>
              DeavenPackage({
                name: packageDirectory.name,
                description: packageDirectory.description,
                bundle: packageDirectory.bundle,
                dependencies: packageDirectory.dependencies
              })
            )
          )
        : Tuple()
    );
}

export async function getPackageDirectories(
  packagesDefinitions: Array<PackageDefinition>,
  generatedBundle: RollupOutput
) {
  const codeForPackages = packagesDefinitions.map(packageDef => {
    debugger;
    const chunk = (generatedBundle.output.find(
      chunk =>
        ((chunk as unknown) as OutputChunk).facadeModuleId!.replace(
          /\.[^/.]+$/,
          ""
        ) === resolve(packageDef.main)
    ) as unknown) as OutputChunk;

    return {
      packageDef,
      virtualFileName: chunk.fileName,
      code: chunk.code,
      imports: chunk.imports,
      map: chunk.map
    };
  });

  return packagesDefinitions.map((packageDef, index) => {
    const indexFile = codeForPackages[index].code;
    const indexMapFile = codeForPackages[index].map;
    const dependencies = codeForPackages[index].imports.reduce(
      (result, importedModule) => {
        const importedPackage = codeForPackages.find(
          x => x.virtualFileName === importedModule
        );
        if (importedPackage) {
          return {
            ...result,
            [`@deaven/${importedPackage.packageDef.name}`]: `^${
              importedPackage.packageDef.version
            }`
          };
        } else {
          const versionConstraint = packageDef.dependencies[importedModule];
          return {
            ...result,
            [importedModule]: versionConstraint
          };
        }
      },
      {}
    );

    return {
      name: packageDef.name,
      description: packageDef.description,
      bundle: {
        compiled: indexFile,
        sourceMap: indexMapFile
      },
      dependencies
    };
  });
}

export async function compilePackages(
  packagesDefinitions: Array<PackageDefinition>,
  cache?: RollupCache
) {
  const bundle = await rollup({
    external: id => !id.startsWith(".") && !id.startsWith("/"),
    input: packagesDefinitions.map(x => x.main),
    cache,
    onwarn: () => {},
    plugins: [
      nodeResolve({
        jsnext: true,
        extensions
      }),
      babel({
        extensions
      })
    ]
  });

  const generatedBundle = await bundle.generate({
    sourcemap: true,
    format: "cjs",
    sourcemapFile: "index.js"
  });

  return {
    generatedBundle,
    watchFiles: bundle.watchFiles,
    cache: bundle.cache
  };
}
