const path = require('path');

module.exports = {
  mode: 'production',
  entry: {
    backend: "./src/backend/backend.ts",
    page: "./src/page/page.ts",
    background: "./src/background/background.ts",
  },
  output: {
    filename: '[name].js',
    path: path.resolve(__dirname, 'dist'),
  },
  resolve: {
    extensions: [".ts", ".js"],
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        loader: "ts-loader"
      },
    ]
  },
  devtool: 'source-map'
};
