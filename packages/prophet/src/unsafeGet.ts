export function unsafeGet(obj: any, prop: string) {
  return obj[prop];
}

export function unsafeCast<T>(obj: any) {
  return (obj as any) as T;
}
