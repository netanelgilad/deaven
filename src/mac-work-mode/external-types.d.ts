declare module "applescript" {
  export function execString(
    script: string,
    cb: (err: Error, result: unknown) => any
  ): void;
}
