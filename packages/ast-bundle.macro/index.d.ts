declare const astBundle: (
  ast: any,
  options?: {
    export?: boolean;
  }
) => string;
export default astBundle;
