import { TESBoolean, Any, ValueIdentifier, isESBoolean } from "../types";

export function ESBoolean(value?: boolean): TESBoolean {
  return {
    type: "boolean",
    id: ValueIdentifier(),
    properties: {},
    value
  };
}

export function coerceToBoolean(val: Any): TESBoolean {
  if (isESBoolean(val)) {
    return val;
  }
  return ESBoolean(true);
}
