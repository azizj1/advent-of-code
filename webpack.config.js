const path = require('path');
const webpack = require('webpack');
const CleanPlugin = require('clean-webpack-plugin');
const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin');
const { spawn } = require('child_process');

const BUILD_DIR = path.join(__dirname, 'build');
const STATS = 'errors-warnings';

// webpack watch will only build files after it detects a change
// you have to build something to actually run your code after webpack is done
const shellPlugin = {
  apply: (compiler) => {
    compiler.hooks.afterEmit.tap('AfterEmitPlugin', () => {
      spawn('node', ['build/watch.js'], { shell: true, stdio: 'inherit' });
    });
  },
};

class Logger {
  error(...args) {
    console.error(...args);
  }
  warn(...args) {
    console.warn(...args);
  }
  // we silent console.info because ForkTsCheckerWebpackPlugin has an annoying
  // console.info every time files change
  info() {}
}

module.exports = function (env) {
  const entryFile = env.entry || 'watch-single';
  const DEBUG = env.stage !== 'prod' && env.stage !== 'dev';
  const BABEL_CONFIG = {
    babelrc: false,
    presets: [['@babel/typescript']],
    plugins: [
      '@babel/plugin-syntax-bigint',
      '@babel/plugin-proposal-logical-assignment-operators',
    ],
    cacheDirectory: DEBUG,
  };

  const config = {
    mode: DEBUG ? 'development' : 'production',
    target: 'node',
    node: {
      __dirname: false,
    },
    entry: DEBUG ? { watch: `./src/${entryFile}.ts` } : { run: './src/run.ts' },
    output: {
      path: BUILD_DIR,
      filename: '[name].js',
      chunkFilename: '[name].bundle.js',
      publicPath: '/',
      ...(DEBUG
        ? {}
        : {
            libraryTarget: 'commonjs2',
          }),
    },
    devtool: 'inline-source-map',
    resolve: {
      alias: {
        '~': path.join(__dirname, 'src'),
      },
      extensions: ['*', '.tsx', '.ts', '.jsx', '.js', '.json'],
    },
    module: {
      rules: [
        {
          test: /\.tsx?$/i,
          exclude: [/node_modules/, path.join(__dirname, 'vendor')],
          use: [
            {
              loader: 'babel-loader',
              options: BABEL_CONFIG,
            },
          ],
        },
        {
          test: /\.txt$/i,
          exclude: [/node_modules/, path.join(__dirname, 'vendor')],
          use: 'raw-loader',
        },
      ],
    },
    plugins: [
      new ForkTsCheckerWebpackPlugin({
        eslint: { enabled: true, files: 'src/**/*' },
        logger: new Logger(),
      }),
      ...(DEBUG ? [shellPlugin] : [new CleanPlugin([BUILD_DIR])]),
    ],
    cache: DEBUG,
    stats: STATS,
  };

  return config;
};
