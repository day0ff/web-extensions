const {CleanWebpackPlugin} = require('clean-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const path = require('path');

module.exports = {
    mode: 'production',
    devtool: 'inline-source-map',
    entry: {
        'background/background': path.join(__dirname, './src/background/background.js'),
        'content/dashboard': path.join(__dirname, './src/content/dashboard.js'),
        'content/secure': path.join(__dirname, './src/content/secure.js'),
        'popup/popup': path.join(__dirname, './src/popup/popup.js'),
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
            {from: './src/popup', to: 'popup'},
        ])
    ]
};
