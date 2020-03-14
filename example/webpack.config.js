const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");

module.exports = {
  mode: "development",
  entry: {
    index: path.resolve(__dirname, "src/App.tsx"),
  },
  devtool: false,
  output: {
    filename: "[name].js",
    path: path.resolve(__dirname, "./"),
  },
  module: {
    rules: [
      {
        test: /\.(tsx|ts)$/,
        exclude: /node_modules/,
        loader: "ts-loader",
      },
    ],
  },
  resolve: {
    extensions: [".tsx", ".ts", ".js"],
    alias: {
      "react-native$": "react-native-web/dist/index.js",
      react$: "preact/compat/src/index.js",
      preact$: "preact/src/index.js",
      "react-dom$": "preact/compat/src/index.js",
      "react-dom/unstable-native-dependencies$": "preact-responder-event-plugin/src/index.js",
    },
  },
  plugins: [
    new HtmlWebpackPlugin({
      filename: "index.html",
      template: "./src/index.html",
    }),
  ],
};
