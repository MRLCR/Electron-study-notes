const { merge } = require('webpack-merge');
const baseConfig = require('./webpack.base.conf');

const prodConfig = env => merge(baseConfig(env), {
  mode: 'production',
  watch: true,
  watchOptions: {
    poll: 1000,
    aggregateTimeout: 500,
    ignored: /node_modules/,
  },
});

module.exports = prodConfig;
