import "source-map-support/register";
import { render, useState, Tuple, Renderer } from "@deaven/react-atoms.core";
import { join } from "path";
import { FileEvaluationWatcher } from "./FileEvaluationWatcher";
import { ConsoleLog } from "./ConsoleLog";
import { removeSync } from "fs-extra";

removeSync("declarative-packages");

render(useState(undefined).render((state, setState) => {
  return Tuple(
    state ? Renderer({ element: state() }) : ConsoleLog({ message: "No" }),
    FileEvaluationWatcher({
      onEvaluationResult: result => setState(result.default),
      path: join(__dirname, "./Project")
    })
  );
}) as JSX.Element);
