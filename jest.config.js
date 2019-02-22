module.exports = {
  reporters: ["default", ["jest-stare", { resultDir: "results" }]],
  projects: [
    {
      runner: "@deaven/jest-runner-typecheck",
      displayName: "typecheck",
      moduleFileExtensions: ["js", "jsx", "ts", "tsx"],
      testMatch: ["<rootDir>/**/*.ts"],
      roots: ["<rootDir>/src"],
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
      displayName: "test",
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
