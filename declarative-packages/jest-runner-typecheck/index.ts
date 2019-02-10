/// <reference types="node" />
import * as ts from "typescript";
import * as fs from "fs";
import {
  codeFrameColumns as codeFrame,
  SourceLocation
} from "@babel/code-frame";
import { fail, pass } from "create-jest-runner";

class CancelRun extends Error {
  constructor(message?: string) {
    super(message);
    this.name = "CancelRun";
  }
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

const files: ts.MapLike<{
  version: number;
  mtime: number;
  lastResult?: unknown;
}> = {};

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
    noEmit: true,
    allowSyntheticDefaultImports: true,
    jsx: ts.JsxEmit.React,
    skipLibCheck: true
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

module.exports = class TypecheckRunner {
  constructor() {}

  async runTests(
    tests: { path: string }[],
    watcher: { isInterrupted(): boolean },
    onStart: (test: unknown) => Promise<unknown>,
    onResult: (test: unknown, result: unknown) => Promise<unknown>
  ) {
    if (watcher.isInterrupted()) {
      throw new CancelRun();
    }

    for (const test of tests) {
      await onStart(test);
      await onResult(test, this.testFile(test.path));
    }
  }

  getErrors(fileName: string) {
    return services
      .getSemanticDiagnostics(fileName)
      .concat(services.getSyntacticDiagnostics(fileName));
  }

  returnResult(testPath: string, result: unknown) {
    files[testPath].lastResult = result;
    return result;
  }

  testFile(testPath: string) {
    const start = Date.now();

    const baseObj = {
      start,
      title: "tsc",
      test: { path: testPath }
    };

    const { mtime } = fs.statSync(testPath);
    if (!files[testPath]) {
      files[testPath] = { version: 0, mtime: 0 };
    }

    if (+mtime <= +files[testPath].mtime) {
      files[testPath].mtime = +mtime;
      return files[testPath].lastResult;
    }

    files[testPath].version++;
    files[testPath].mtime = +mtime;

    const allDiagnostics = this.getErrors(testPath);

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
      return this.returnResult(testPath, pass({ ...baseObj, end }));
    }

    return this.returnResult(
      testPath,
      fail({
        ...baseObj,
        errorMessage: errors.join("\n\n"),
        end
      })
    );
  }
};
