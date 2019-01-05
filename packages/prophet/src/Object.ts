import { WithProperties, Any, WithValue, Type, ValueIdentifier } from "./types";

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
