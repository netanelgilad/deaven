import {
  codeFrameColumns as codeFrame,
  SourceLocation
} from "@babel/code-frame";
import * as ts from "typescript";
import * as fs from "fs";
import { pass, fail } from "create-jest-runner";

const files: ts.MapLike<{ version: number }> = {};

// Create the language service host to allow the LS to communicate with the host
const servicesHost: ts.LanguageServiceHost = {
  getScriptFileNames: () => Object.keys(files),
  getScriptVersion: fileName =>
    files[fileName] && files[fileName].version.toString(),
  getScriptSnapshot: fileName => {
    if (!fs.existsSync(fileName)) {
      return undefined;
    }

    return ts.ScriptSnapshot.fromString(fs.readFileSync(fileName).toString());
  },
  getCurrentDirectory: () => process.cwd(),
  getCompilationSettings: () => ({
    strict: true,
    moduleResolution: ts.ModuleResolutionKind.NodeJs,
    target: ts.ScriptTarget.ES2017,
    forceConsistentCasingInFileNames: true,
    isolatedModules: true,
    noUnusedLocals: true,
    noUnusedParameters: true,
    noEmit: true
  }),
  getDefaultLibFileName: options => ts.getDefaultLibFilePath(options),
  fileExists: ts.sys.fileExists,
  readFile: ts.sys.readFile,
  readDirectory: ts.sys.readDirectory
};

// Create the language service files
const services = ts.createLanguageService(
  servicesHost,
  ts.createDocumentRegistry()
);

function getErrors(fileName: string) {
  return services
    .getCompilerOptionsDiagnostics()
    .concat(services.getSyntacticDiagnostics(fileName))
    .concat(services.getSemanticDiagnostics(fileName));
}

const appendCodeFrame = ({
  filePath,
  errorMessage,
  location
}: {
  filePath: string;
  errorMessage: string;
  location?: SourceLocation;
}) => {
  if (typeof location === "undefined") {
    return errorMessage;
  }
  const rawLines = fs.readFileSync(filePath, "utf8");
  return `${errorMessage}\n${codeFrame(rawLines, location, {
    highlightCode: true
  })}`;
};

const runTsc = ({
  testPath,
  config: jestConfig
}: {
  testPath: string;
  config: { rootDir: string };
}) => {
  const start = Date.now();
  if (!files[testPath]) {
    files[testPath] = { version: 0 };
  }

  files[testPath].version++;

  const allDiagnostics = getErrors(testPath);

  const baseObj = {
    start,
    title: "tsc",
    test: { path: testPath }
  };

  const errors = allDiagnostics
    .map(diagnostic => {
      if (diagnostic.file) {
        const {
          line: lineStart,
          character: characterStart
        } = diagnostic.file.getLineAndCharacterOfPosition(diagnostic.start!);
        const {
          line: lineEnd,
          character: characterEnd
        } = diagnostic.file.getLineAndCharacterOfPosition(
          diagnostic.start! + diagnostic.length!
        );

        const location = {
          start: {
            line: lineStart + 1,
            column: characterStart + 1
          },
          end: {
            line: lineEnd + 1,
            column: characterEnd + 1
          }
        };

        const message = ts.flattenDiagnosticMessageText(
          diagnostic.messageText,
          "\n"
        );

        return {
          location,
          errorMessage: message,
          filePath: diagnostic.file.fileName
        };
      } else {
        return {
          errorMessage: `${ts.flattenDiagnosticMessageText(
            diagnostic.messageText,
            "\n"
          )}`,
          filePath: testPath
        };
      }
    })
    .map(appendCodeFrame);

  const end = Date.now();

  if (errors.length === 0) {
    return pass({ ...baseObj, end });
  }

  return fail({
    ...baseObj,
    errorMessage: errors.join("\n\n"),
    end
  });
};

module.exports = runTsc;
