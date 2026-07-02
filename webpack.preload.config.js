const path = require('path');
const { merge } = require('webpack-merge');
const base = require('./webpack.base.config');

module.exports = merge(base, {
  target: 'electron-preload',
  entry: { preload: './src/preload/preload.ts' },
  output: {
    path: path.join(__dirname, 'dist/preload'),
    filename: '[name].js',
  },
});
