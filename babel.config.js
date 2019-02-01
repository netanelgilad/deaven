module.exports = {
  plugins: ["babel-plugin-macros"],
  presets: [
    [
      "@babel/preset-env",
      {
        targets: {
          node: true
        }
      }
    ],
    "@babel/typescript",
    "@babel/preset-react"
  ]
};
