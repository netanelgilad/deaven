export const unsafeCast = <T>(obj: any) => {
  return (obj as any) as T;
};
export default unsafeCast;
