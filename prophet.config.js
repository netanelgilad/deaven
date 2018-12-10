module.exports = {
  collectCoverage: true,
  collectCoverageFrom: ["<rootDir>/packages/prophet/**/*"],
  transform: {
    "^.+\\.tsx?$": "ts-jest"
  },
  testRegex: "(/__tests__/.*|(\\.|/)(test|spec))\\.(jsx?|tsx?)$",
  moduleFileExtensions: ["ts", "tsx", "js", "jsx", "json", "node"],
  roots: ["<rootDir>/packages/prophet-tests"]
};
