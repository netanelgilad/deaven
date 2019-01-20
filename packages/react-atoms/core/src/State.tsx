import * as React from "react";
import { HookComponent } from "./HookComponent";

export type StateRenderer<TState> = (
  state: TState,
  setState: (newState: TState) => void
) => JSX.Element | null;

export type StateProps<TState> = {
  initialState: TState;
  children: StateRenderer<TState>;
};

export class StateAsClass<TState> extends React.Component<
  StateProps<TState>,
  {
    value: TState;
  }
> {
  constructor(props: StateProps<TState>) {
    super(props);

    this.state = { value: props.initialState };
  }

  updateState = (newState: TState) => {
    this.setState({
      value: newState
    });
  };

  render() {
    return this.props.children(this.state.value, this.updateState);
  }
}

export function State<TState>(props: StateProps<TState>) {
  if ("useState" in React) {
    const [state, setState] = (React as any).useState(props.initialState);
    return props.children(state, setState);
  } else {
    return <StateAsClass {...props} />;
  }
}

export function useState<TState>(initialState: TState) {
  return new HookComponent(renderer => {
    return <State initialState={initialState} children={renderer} />;
  });
}
