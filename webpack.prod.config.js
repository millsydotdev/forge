const path = require('path');
const { merge } = require('webpack-merge');
const base = require('./webpack.base.config');

const prod = merge(base, {
  mode: 'production',
  devtool: false,
  optimization: {
    minimize: true,
    usedExports: true,
    sideEffects: false,
    splitChunks: {
      chunks: 'all',
      cacheGroups: {
        vendor: {
          test: /[\\/]node_modules[\\/]/,
          name: 'vendors',
          chunks: 'all',
        },
      },
    },
  },
});

const mainConfig = merge(prod, {
  target: 'electron-main',
  node: { __dirname: false, __filename: false },
  entry: { index: './src/browser/index.ts' },
  output: {
    path: path.join(__dirname, 'dist/browser'),
    filename: '[name].js',
  },
  externals: {
    '@wfcd/items': 'commonjs @wfcd/items',
    '@napi-rs/canvas': 'commonjs @napi-rs/canvas',
  },
});

const preloadConfig = merge(prod, {
  target: 'electron-preload',
  entry: { preload: './src/preload/preload.ts' },
  output: {
    path: path.join(__dirname, 'dist/preload'),
    filename: '[name].js',
  },
});

const rendererConfig = merge(prod, {
  target: 'electron-renderer',
  entry: { app: './src/renderer/index.tsx' },
  output: {
    path: path.join(__dirname, 'dist/renderer'),
    filename: '[name].[contenthash].js',
  },
});

module.exports = [mainConfig, preloadConfig, rendererConfig];
