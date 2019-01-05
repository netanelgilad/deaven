import { TESBoolean, Type } from "../types";

export function ESBoolean(value?: boolean): TESBoolean {
  return {
    properties: {},
    value
  };
}

export function coerceToBoolean(val: Type): TESBoolean {
  return ESBoolean(true);
}
