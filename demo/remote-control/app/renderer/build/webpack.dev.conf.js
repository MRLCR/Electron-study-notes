const webpack = require('webpack');
const { merge } = require('webpack-merge');
const baseConfig = require('./webpack.base.conf');

const devConfig = env => merge(baseConfig(env), {
  mode: 'development',
  devServer: {
    open: false,
    hot: true,
  },
  plugins: [
    new webpack.HotModuleReplacementPlugin(),
  ],
});

module.exports = devConfig;
