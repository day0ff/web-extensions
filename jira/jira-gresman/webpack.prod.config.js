const {CleanWebpackPlugin} = require('clean-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const path = require('path');

module.exports = {
    mode: 'production',
    devtool: 'inline-source-map',
    entry: {
        'background/background': path.join(__dirname, './src/background/background.js'),
        'content/content': path.join(__dirname, './src/content/content.js'),
    },
    output: {
        path: path.join(__dirname, 'prod'),
        filename: '[name].js'
    },
    plugins: [
        new CleanWebpackPlugin(),
        new CopyWebpackPlugin([
            {from: './src/manifest.json', to: 'manifest.json'},
            {from: './src/icons', to: 'icons'},
        ])
    ]
};
