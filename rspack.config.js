const path = require('path');

function getEntryPath() {
    try {
        const config = require('./jukkit.config.js');
        const projectConfig = (config.default || config).project || {};
        const typescript = projectConfig.typescript;
        const tsEnabled = typescript && typescript.enable === true;
        const entry = projectConfig.entry || 'index.js';

        if (tsEnabled) {
            const tsEntry = typescript.entry || entry.replace(/\.js$/, '.ts');
            const tsEntryBase = path.basename(tsEntry);
            return `./dist/ts/${tsEntryBase}`;
        }

        return `./src/${entry}`;
    } catch (err) {
        return './src/index.js';
    }
}

module.exports = {
    target: ['web', 'es5'],
    entry: {
        index: getEntryPath()
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
