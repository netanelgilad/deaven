import * as ReactReconciler from "react-reconciler";
import { useRef } from "./Ref";
import { useEffect } from "./Effect";

const rootHostContext = {};
const childHostContext = {};

const hostConfig = {
  now: Date.now,
  getRootHostContext: () => {
    return rootHostContext;
  },
  prepareForCommit: () => {},
  resetAfterCommit: () => {},
  getChildHostContext: () => {
    return childHostContext;
  },
  shouldSetTextContent: (_type: any, props: any) => {
    return (
      typeof props.children === "string" || typeof props.children === "number"
    );
  },
  /**
   This is where react-reconciler wants to create an instance of UI element in terms of the target. Since our target here is the DOM, we will create document.createElement and type is the argument that contains the type string like div or img or h1 etc. The initial values of domElement attributes can be set in this function from the newProps argument
   */
  createInstance: () => {},
  createTextInstance: () => {},
  appendInitialChild: () => {},
  appendChild() {},
  finalizeInitialChildren: () => {},
  supportsMutation: true,
  appendChildToContainer: () => {},
  prepareUpdate() {
    return true;
  },
  commitUpdate() {},
  commitTextUpdate() {},
  removeChild() {}
};

export const NullRenderer = ReactReconciler(hostConfig as any);

export function Renderer(props: { element: Element }) {
  return useRef(undefined)
    .compose(ref =>
      useEffect(() => {
        ref.current = NullRenderer.createContainer({}, false, false);
      }, [])
    )
    .compose(ref =>
      useEffect(
        () => {
          NullRenderer.updateContainer(
            props.element,
            ref.current,
            null,
            () => {}
          );
        },
        [props.element]
      )
    )
    .render();
}
