import {
  TESBoolean,
  Any,
  ValueIdentifier,
  isESBoolean,
  isESNumber,
  isESNull,
  isUndefined,
  isESString
} from "../types";
import { unimplemented } from "../../../unimplemented";

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

  if (isESNumber(val)) {
    return typeof val.value === "number"
      ? val.value === 0
        ? ESBoolean(false)
        : ESBoolean(true)
      : ESBoolean();
  }

  if (isESNull(val) || isUndefined(val)) {
    return ESBoolean(false);
  }

  if (isESString(val)) {
    return typeof val.value === "string"
      ? val.value === ""
        ? ESBoolean(false)
        : ESBoolean(true)
      : unimplemented();
  }

  return unimplemented();
}
