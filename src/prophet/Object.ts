import {
  WithProperties,
  Any,
  WithValue,
  Type,
  ValueIdentifier,
  FunctionBinding
} from "./types";
import {
  TExecutionContext,
  setCurrentThisValue
} from "./execution-context/ExecutionContext";
import { unsafeCast } from "@deaven/unsafe-cast";
import { tuple } from "@deaven/tuple";

export type TESObject = Type<"object"> &
  WithProperties &
  WithValue<{ [key: string]: Any }> & {
    type: "object";
  };

export function ESObject(value?: { [key: string]: Any }): TESObject {
  return {
    type: "object",
    id: ValueIdentifier(),
    properties: value || {},
    value
  };
}

export function isESObject(arg: any): arg is TESObject {
  return arg.type === "object";
}

export function* createNewObjectFromConstructor(
  calleeType: FunctionBinding,
  argsTypes: Any[],
  execContext: TExecutionContext
) {
  const thisValue = ESObject({});
  const currExecContext = setCurrentThisValue(execContext, thisValue);

  const [, afterCallExecContext] = yield* calleeType.function.implementation(
    thisValue,
    argsTypes,
    currExecContext
  );

  return tuple(
    ESObject({
      ...unsafeCast<TESObject>(calleeType.properties.prototype).properties,
      ...unsafeCast<TESObject>(afterCallExecContext.value.thisValue).value
    }),
    afterCallExecContext
  );
}
