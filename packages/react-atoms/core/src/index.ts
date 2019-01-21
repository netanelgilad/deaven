import * as React from "react";

export * from "./render";
export * from "./State";
export * from "./Effect";
export * from "./Ref";
export * from "./NullRenderer";

export function Tuple<T extends React.ReactNode[]>(...props: T) {
  return React.createElement(React.Fragment, null, ...props);
}
