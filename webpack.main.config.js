/* eslint-disable @typescript-eslint/no-var-requires */
const CopyWebpackPlugin = require("copy-webpack-plugin");
const path = require("path");

const assets = ["assets"];

const copyPlugins = new CopyWebpackPlugin({
  patterns: assets.map((asset) => {
    return {
      from: path.resolve(__dirname, "src", asset),
      to: asset,
    };
  }),
});

module.exports = {
  /**
   * This is the main entry point for your application, it's the first file
   * that runs in the main process.
   */
  entry: "./src/index.ts",
  // Put your normal webpack config below here
  module: {
    rules: require("./webpack.rules"),
  },
  resolve: {
    extensions: [".js", ".ts", ".jsx", ".tsx", ".css", ".json"],
  },
  plugins: [copyPlugins],
};
