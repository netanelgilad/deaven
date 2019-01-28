module.exports = {
  projects: [
    {
      runner: "jest-runner-typecheck",
      displayName: "typecheck",
      moduleFileExtensions: ["js", "jsx", "ts", "tsx"],
      testMatch: ["<rootDir>/**/*.ts"],
      roots: ["<rootDir>/packages"],
      testPathIgnorePatterns: [
        "/node_modules/",
        "<rootDir>/(?:.+?)/lib/(?:.+?)"
      ],
      watchPathIgnorePatterns: [
        "<rootDir>/(?:.+?)\\.js",
        "<rootDir>/(?:.+?)/lib/(?:.+?)"
      ]
    },
    {
      displayName: "dummy",
      testMatch: ["dummy"],
      watchPathIgnorePatterns: ["(?:.+?)"]
    }
  ]
};
