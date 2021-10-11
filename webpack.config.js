const path = require('path');
const CopyPlugin = require('copy-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const MomentLocalesPlugin = require('moment-locales-webpack-plugin');
const webpack = require('webpack');

module.exports = {
    mode: "development",
    entry: path.resolve(__dirname, './src/app.js'),
    module: {
        rules: [
            {
                test: /\.(js)$/,
                exclude: /node_modules/,
                use: ['babel-loader']
            },
            {
                test: /\.css$/,
                use: [
                    'style-loader',
                    'css-loader',
                ],
            },
        ]
    },
    plugins: [
        new MomentLocalesPlugin(),
        new webpack.ProvidePlugin({
            Buffer: ['buffer', 'Buffer'],
        }),
        new CopyPlugin({
            patterns: [
                {from: "*.html"},
                {from: "public/js/*.js"},
                {from: "public/json/*.json"},
                {from: "public/img/*.png"},
                {from: "public/img/*.svg"},
                {from: "public/img/*.ico"},
            ],
        }),
    ],
    resolve: {
        extensions: ['*', '.js'],
    },
    output: {
        path: path.resolve(__dirname, './dist'),
        filename: 'bundle.js',
        library: 'dgc'
    },
    devServer: {
        static: {
            directory: path.join(__dirname, './dist'),
        },
    },
};
