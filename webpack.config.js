const path = require('path');
const webpack = require('webpack');
const CleanPlugin = require('clean-webpack-plugin');
const WebpackShellPlugin = require('webpack-shell-plugin');
const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin');

const BUILD_DIR = path.join(__dirname, 'build');
const STATS = {
    colors: true,
    reasons: false,
    hash: false,
    version: false,
    timings: true,
    chunks: false,
    chunkModules: false,
    cached: false,
    cachedAssets: false,
    children: false,
    errors: true,
    errorDetails: true,
    warnings: true,
    warningsFilter: /^(?!CriticalDependenciesWarning$)/
};

module.exports = function (env) {
    const DEBUG = env !== 'prod' && env !== 'dev';
    const BABEL_CONFIG = {
        babelrc: false,
        presets: [
            ['@babel/env', { 'targets': { 'node': '10.17' } }],
            ['@babel/typescript']],
        plugins: [
            '@babel/plugin-proposal-class-properties',
            '@babel/plugin-proposal-object-rest-spread',
            '@babel/plugin-proposal-numeric-separator',
            '@babel/plugin-proposal-nullish-coalescing-operator',
            '@babel/plugin-proposal-optional-chaining',
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
                test: /\.tsx?$/,
                exclude: [
                    /node_modules/,
                    path.join(__dirname, 'vendor')
                ],
                use: [
                    {
                        loader: 'babel-loader',
                        options: BABEL_CONFIG
                    }
                ]
            }]
        },
        plugins: [
            new webpack.DefinePlugin(GLOBALS),
            new ForkTsCheckerWebpackPlugin({ eslint: true }),
            ... DEBUG ? [
                new WebpackShellPlugin({onBuildExit: ['node ./build/watch.js']})
            ] : [
                new CleanPlugin([BUILD_DIR])
            ]
        ],
        cache: DEBUG,
        stats: STATS
    };

    return config;
}
