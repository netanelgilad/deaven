import * as React from "react";
import { HookComponent } from "./HookComponent";

export type EffectRenderer = () => JSX.Element | null;

export type EffectCleanup = (() => void) | void;

export type EffectFn = () => EffectCleanup;

export type EffectProps = {
  doFn: EffectFn;
  inputs?: any[];
  children?: EffectRenderer;
};

export class EffectAsClass extends React.Component<EffectProps, {}> {
  cleanup?: EffectCleanup;

  constructor(props: EffectProps) {
    super(props);
  }

  runDoFn() {
    if (this.cleanup) {
      this.cleanup();
    }

    this.cleanup = this.props.doFn();
  }

  componentDidMount() {
    this.runDoFn();
  }

  componentDidUpdate(prevProps: EffectProps) {
    if (this.props.inputs && this.props.inputs.length === 0) {
      return;
    }

    if (this.props.inputs && prevProps.inputs) {
      if (prevProps.inputs[0] !== this.props.inputs[0]) {
        this.runDoFn();
      }
    } else {
      this.runDoFn();
    }
  }

  componentWillUnmount() {
    if (this.cleanup) {
      this.cleanup();
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
