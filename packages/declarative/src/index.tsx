import "source-map-support/register";
import { render, useState, Tuple, Renderer } from "@deaven/react-atoms.core";
import { join } from "path";
import { FileEvaluationWatcher } from "./FileEvaluationWatcher";
import { ConsoleLog } from "./ConsoleLog";

render(useState(undefined).render((renderFn, setRenderFn) => {
  return Tuple(
    renderFn
      ? Renderer({ element: renderFn() })
      : ConsoleLog({ message: "No" }),
    FileEvaluationWatcher({
      onEvaluationResult: result => setRenderFn(result.default),
      path: join(__dirname, "./Project")
    })
  );
}) as JSX.Element);
