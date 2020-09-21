const path = require('path');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');

const resolve = url => path.resolve(__dirname, '../', url);

const entry = resolve('./src/main/index.tsx');
console.log(entry)

const config = env => ({
  entry,
  output: {
    filename: 'app.js',
    path: resolve('pages/main'), // TODO: 由于 demo 只需简单的生成一个页面 所有这里简单的处理到一个目录中，不偷懒的话 这里需要配置一个多入口多出口的多页应用
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        include: resolve('src'),
        exclude: /node_modules/,
        use: [{
            loader: 'ts-loader'
        }],
      },
      {
        test: /\.css$/,
        use: [
          'style-loader',
          'css-loader',
        ],
      }
    ],
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: resolve('./template/index.html'),
      filename: 'index.html',
    }),
    new webpack.BannerPlugin('Author: linchuran'),
    new webpack.DefinePlugin({
      ENV: JSON.stringify(env),
    }),
  ],
  resolve: {
    modules: ['node_modules'],
    extensions: ['.ts', '.tsx', '.js', '.jsx', '.json'],
    alias: {
      '@': resolve('src'),
    },
  },
});

module.exports = config;
