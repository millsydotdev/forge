const path = require('path');
const { merge } = require('webpack-merge');
const base = require('./webpack.base.config');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = merge(base, {
  target: 'electron-renderer',
  entry: { app: './src/renderer/index.tsx' },
  output: {
    path: path.join(__dirname, 'dist/renderer'),
    filename: '[name].js',
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: './src/renderer/index.html',
      filename: 'index.html',
      chunks: ['app'],
    }),
  ],
});
