import * as React from "react";
import { HookComponent } from "./HookComponent";

export type EffectRenderer = () => JSX.Element | null;

export type EffectFn = () => (() => void) | unknown;

export type EffectProps = {
  doFn: EffectFn;
  inputs?: any[];
  children?: EffectRenderer;
};

export class EffectAsClass extends React.Component<EffectProps, {}> {
  componentDidMount() {
    this.props.doFn();
  }

  componentDidUpdate(prevProps: EffectProps) {
    if (this.props.inputs && prevProps.inputs) {
      if (prevProps.inputs[0] !== this.props.inputs[0]) {
        this.props.doFn();
      }
    } else {
      this.props.doFn();
    }
  }

  render() {
    return this.props.children ? this.props.children() : null;
  }
}

export function Effect(props: EffectProps) {
  if ("useEffect" in React) {
    (React as any).useEffect(props.doFn, props.inputs);
    return props.children ? props.children() : null;
  } else {
    return <EffectAsClass {...props} />;
  }
}

export function useEffect(effectFn: EffectFn, inputs?: any[]) {
  return new HookComponent(renderer => {
    return <Effect doFn={effectFn} inputs={inputs} children={renderer} />;
  });
}
