const path = require('path');
const { merge } = require('webpack-merge');
const base = require('./webpack.base.config');

module.exports = merge(base, {
  target: 'electron-main',
  node: { __dirname: false, __filename: false },
  entry: { index: './src/browser/index.ts' },
  output: {
    path: path.join(__dirname, 'dist/browser'),
    filename: '[name].js',
  },
  externals: {
    '@wfcd/items': 'commonjs @wfcd/items',
    '@wfcd/mod-generator': 'commonjs @wfcd/mod-generator',
    '@napi-rs/canvas': 'commonjs @napi-rs/canvas',
  },
});
