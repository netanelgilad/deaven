import * as React from "react";
import { HookComponent } from "./HookComponent";

export function Provider<T extends React.Context<any>>(Context: T) {
  return (props: { value: any; children: JSX.Element }) => (
    <Context.Provider {...props} />
  );
}

export function useContext<T extends React.Context<any>>(context: T) {
  return new HookComponent(renderer => {
    return <context.Consumer children={renderer} />;
  });
}
