const dotenv = require("dotenv");
const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const { CleanWebpackPlugin } = require("clean-webpack-plugin");

dotenv.config({ path: path.join(__dirname, ".env") });

module.exports = {
  mode: "development",
  entry: "./src/index.js",
  output: {
    path: path.resolve(__dirname, "dist"),
    filename: "[name].bundle.js",
    chunkFilename: "[name].bundle.js",
  },
  devtool: "inline-source-map",
  devServer: {
    static: "./dist",
    host: process.env.HOST || "localhost",
    port: process.env.PORT || 3000,
  },
  plugins: [
    new CleanWebpackPlugin(),
    new HtmlWebpackPlugin({
      hash: false,
      filename: "index.html",
      title: "Tone-Gen",
    }),
  ],
  module: {
    rules: [
      {
        test: /\.css$/i,
        use: ["style-loader", "css-loader"],
      },
      {
        test: /\.wav$/i,
        use: [{ loader: "file-loader" }],
      },
    ],
  },
};
