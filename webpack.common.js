const path = require('path');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
  entry: './src/run-planner.ts',
  module: {
    rules: [
      {
        test: /\.ts$/,
        use: 'ts-loader',
        exclude: /node_modules/
      }
    ]
  },
  resolve: {
    extensions: ['.ts', '.js']
  },
     plugins: [
         new CleanWebpackPlugin(),
         new HtmlWebpackPlugin({
           title: 'Output Management',
           template: 'src/index.html'
         })
       ],
  optimization: {
    splitChunks: {
      chunks: 'all',
      name: 'vendor'
    }
  },
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: '[name].js',
    chunkFilename: '[name].bundle.js',
  }
};
