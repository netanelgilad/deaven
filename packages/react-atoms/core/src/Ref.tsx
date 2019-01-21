import * as React from "react";
import { HookComponent } from "./HookComponent";

export type RefRenderer<TValue> = (
  ref: React.RefObject<TValue>
) => JSX.Element | null;

export type RefProps<TValue> = {
  initialValue: TValue;
  children: RefRenderer<TValue>;
};

class RefAsClass<TValue> extends React.Component<RefProps<TValue>, {}> {
  ref: React.RefObject<TValue>;

  constructor(props: RefProps<TValue>) {
    super(props);
    this.ref = React.createRef();
    (this.ref as any).current = props.initialValue;
  }

  render() {
    return this.props.children(this.ref);
  }
}

export function Ref<TValue>(props: RefProps<TValue>) {
  if ("useRef" in React) {
    const ref = (React as any).useRef(props.initialValue);
    return props.children(ref);
  } else {
    return <RefAsClass {...props} />;
  }
}

export function useRef<T>(initialValue: T) {
  return new HookComponent(renderer => {
    return <Ref initialValue={initialValue} children={renderer} />;
  });
}
