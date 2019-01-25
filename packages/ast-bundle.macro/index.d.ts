declare const astBundle: (
  ast: any,
  options?: {
    export?: boolean;
  }
) => {
  source: string;
  compiled: string;
  declarationMap: string;
  declaration: string;
};
export default astBundle;
