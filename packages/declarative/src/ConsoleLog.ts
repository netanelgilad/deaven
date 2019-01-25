import { useEffect } from "@deaven/react-atoms.core";

type ParmetersOf<T extends (...args: any[]) => any> = T extends (
  ...args: infer U
) => any
  ? U
  : never;

export function ConsoleLog<T>(props: {
  message: T extends any[]
    ? ParmetersOf<typeof console.log>
    : ParmetersOf<typeof console.log>[0];
}) {
  return useEffect(
    () => {
      console.log(props.message);
    },
    [props.message]
  ).render();
}
