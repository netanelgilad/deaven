import { NullRenderer } from "./NullRenderer";
import { ReactElement } from "react";

export function render(
  reactElement: ReactElement<any>,
  callback?: () => void | null | undefined
) {
  const container = NullRenderer.createContainer({}, false, false);
  NullRenderer.injectIntoDevTools({
    bundleType: 1, // 0 for PROD, 1 for DEV
    version: "0.1.0", // version for your renderer
    rendererPackageName: "custom-renderer" // package name
  });
  return NullRenderer.updateContainer(
    reactElement,
    container,
    null,
    callback || (() => {})
  );
}
