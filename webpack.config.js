const path = require('path'),
  webpack = require('webpack')

module.exports = {
  entry: './src/index.js',
  mode: 'production',
  devtool: 'source-map',
  target: 'node',
  output: {
    filename: 'index.bundle.js',
    libraryTarget: 'commonjs2',
    libraryExport: 'default',
    path: path.resolve(__dirname, 'release'),
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        loader: 'babel-loader',
      },
    ],
  },
  plugins: [new webpack.optimize.ModuleConcatenationPlugin()],
}
