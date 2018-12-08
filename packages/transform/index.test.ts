import { parse } from "@babel/parser";

type StringChange = [number, number, string?];

export function updateASTWithStringChange(props: {
  previousAST: unknown;
  stringChange: Array<StringChange>;
}) {
  return [parse(props.stringChange[0][2], { sourceType: "module" })];
}

// it("should ", () => {
//   expect(
//     updateASTWithStringChange({
//       previousAST: undefined,
//       stringChange: [
//         [
//           0,
//           0,
//           `export default { type: 'directory', files: [{ name: 'package.json', contents: '{ "name": "transform" }'}]}`
//         ]
//       ]
//     })
//   ).toEqual([]);
// });
