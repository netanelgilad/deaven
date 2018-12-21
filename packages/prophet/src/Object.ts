export type TESObject = {
  type: "object";
  value?: Object;
};

export function ESObject(value?: Object): TESObject {
  return {
    type: "object",
    value
  };
}
