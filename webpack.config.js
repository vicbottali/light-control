const path = require("path");
const webpack = require("webpack");
const dotenv = require('dotenv').config();
const 
    PORT = process.env.REACT_PORT || 3000,
    EXP_PORT = process.env.EXP_PORT || 8000;

module.exports = {
  entry: "./src/index.js",
  mode: "development",
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        exclude: /(node_modules|bower_components)/,
        loader: "babel-loader",
        options: { presets: ["@babel/env"] }
      },
      {
        test: /\.css$/,
        use: ["style-loader", "css-loader"]
      }
    ]
  },
  resolve: { extensions: ["*", ".js", ".jsx"] },
  output: {
    path: path.resolve(__dirname, "public/"),
    publicPath: "/public/",
    filename: "bundle.js"
  },
  devServer: {
    contentBase: path.join(__dirname, "public/"),
    port: 3000,
    publicPath: `http://localhost:${PORT}`,
    hotOnly: true
  },
  plugins: [
      new webpack.HotModuleReplacementPlugin(),
      new webpack.DefinePlugin({
          "process.env.EXP_PORT": EXP_PORT
      })
    ]
};