/**
 * Created by HP on 3/15/2018.
 */
const path = require('path');

module.exports = (env, args) => {
    const inDevelopment = (args.mode === 'development');

    return {
        entry: './src/routeVerifier.js',
        output: {
            path: path.resolve(__dirname, inDevelopment ? 'dist/dev' : 'dist/prod'),
            filename: inDevelopment ? 'edk-route-verifier.js' : 'edk-route-verifier.min.js'
        },
        module: {
            rules: [
                {
                    test: /\.js$/,
                    exclude: /(node_modules|tests)/,
                    use: {
                        loader: 'babel-loader',
                        options: {
                            presets: ['@babel/preset-env']
                        }
                    }
                }
            ]
        },
        devtool:  inDevelopment ? 'eval-source-map' : 'source-map'
    }
}