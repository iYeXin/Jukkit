const path = require('path');

module.exports = {
    target: ['web', 'es5'],
    entry: {
        index: './src/index.js'
    },
    output: {
        path: path.resolve(__dirname, 'dist/rspack'),
        filename: '[name].js',
        library: {
            type: 'commonjs2'
        },
        clean: true
    },
    module: {
        rules: [
            {
                test: /\.js$/,
                exclude: /node_modules|\.jukkit[\\\/]init/,
                use: {
                    loader: 'babel-loader',
                    options: {
                        presets: [
                            [
                                '@babel/preset-env',
                                {
                                    targets: {
                                        ie: '10'
                                    },
                                    modules: 'cjs',
                                    useBuiltIns: 'usage',
                                    corejs: 3
                                }
                            ]
                        ]
                    }
                }
            }
        ]
    },
    optimization: {
        minimize: true
    },
    externals: {
    },
    resolve: {
        extensions: ['.js'],
        modules: [
            path.resolve(__dirname, '.jukkit/modules'),
            'node_modules'
        ]
    }
};
