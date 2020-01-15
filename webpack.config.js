const path = require('path');
const webpack = require('webpack');
const CleanPlugin = require('clean-webpack-plugin');
const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin');
const { spawn } = require('child_process');

const BUILD_DIR = path.join(__dirname, 'build');
const STATS = 'errors-warnings';

const shellPlugin = {
    apply: (compiler) => {
        compiler.hooks.afterEmit.tap('AfterEmitPlugin', () => {
            spawn('node', ['build/watch.js'], {shell: true, stdio: 'inherit' });
          });
    }
};

class Logger {
    error(...args) {
        console.error(...args);
    };
    warn(...args) {
        console.warn(...args);
    };
    info() {}
}

module.exports = function (env) {
    const DEBUG = env !== 'prod' && env !== 'dev';
    const BABEL_CONFIG = {
        babelrc: false,
        presets: [
            ['@babel/env', { 'targets': { 'node': 'current' } }],
            ['@babel/typescript']],
        plugins: [
            '@babel/plugin-proposal-class-properties',
            '@babel/plugin-proposal-object-rest-spread',
            '@babel/plugin-proposal-numeric-separator',
            '@babel/plugin-proposal-nullish-coalescing-operator',
            '@babel/plugin-proposal-optional-chaining',
            '@babel/plugin-syntax-bigint',
            'lodash'
        ],
        cacheDirectory: DEBUG 
    };
    const GLOBALS = {
        'process.env.NODE_ENV': JSON.stringify(DEBUG ? 'local' : env === 'prod' ? 'production' : 'development')
    };

    const config = {
        mode: DEBUG ? 'development' : 'production',
        target: 'node',
        node: {
            __dirname: false
        },
        entry: DEBUG ?
            { 'watch': './src/watch.ts' } :
            { 'run': './src/run.ts' }
        ,
        output: {
            path: BUILD_DIR,
            filename: '[name].js',
            chunkFilename: '[name].bundle.js',
            publicPath: '/',
            ... DEBUG ? {} : {
                libraryTarget: 'commonjs2'
            }
        },
        resolve: {
            alias: {
                '~': path.join(__dirname, 'src')
            },
            extensions: ['*', '.tsx', '.ts', '.jsx', '.js', '.json']
        },
        module: {
            rules: [{
                test: /\.tsx?$/i,
                exclude: [/node_modules/, path.join(__dirname, 'vendor')],
                use: [{
                    loader: 'babel-loader',
                    options: BABEL_CONFIG
                }]
            }, {
                test: /\.txt$/i,
                exclude: [/node_modules/, path.join(__dirname, 'vendor')],
                use: 'raw-loader'
            }]
        },
        plugins: [
            new webpack.DefinePlugin(GLOBALS),
            new ForkTsCheckerWebpackPlugin({ eslint: true, logger: new Logger() }),
            ... DEBUG ? [shellPlugin] : [
                new CleanPlugin([BUILD_DIR])
            ]
        ],
        cache: DEBUG,
        stats: STATS
    };

    return config;
}
