import { WithProperties, Type } from "./types";

export type TESObject = WithProperties & {
  type: "object";
  value?: { [key: string]: Type };
};

export function ESObject(value?: { [key: string]: Type }): TESObject {
  return {
    type: "object",
    properties: value || {},
    value
  };
}
