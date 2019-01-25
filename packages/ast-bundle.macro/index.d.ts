declare const astBundle: (
  ast: any,
  options?: {
    export?: boolean;
  }
) => {
  name: string;
  source: string;
  compiled: string;
  declarationMap: string;
  declaration: string;
};
export default astBundle;
