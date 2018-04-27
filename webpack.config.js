/**
 * Created by HP on 3/8/2018.
 */
const p = require('path');

module.exports = (env = {}, args = {}) => {
    /*
     * Establish dynamic file names and path based on env DIST var and mode
     * Which are set from package.json
    */
    const inDevelopment = (args.mode === 'development');
    const distribution  = env.DIST;
    const filename      = inDevelopment ? 'edk-route-verifier.js' : 'edk-route-verifier.min.js';
    const path          = p.resolve(__dirname, getPath(distribution, inDevelopment));

    const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;

    return {
        entry: './src/routeVerifier.js',
        output: {
            path,
            filename
        },
        module: {
            rules: [
                {
                    test: /\.js$/,
                    exclude: /node_modules/,
                    use: {
                        loader: 'babel-loader'
                    }
                }
            ]
        },
        devtool:  inDevelopment ? 'eval-source-map' : 'source-map'
    }
}

/**
 * This function establish path basing on env vars and mode
 * @param dist
 * @param dev
 * @returns {*}
 */
const getPath = (dist, dev) => {
    let path;
    if(dist) {
        path = 'dist';
    } else {
        path = 'server/static/js';
    }
    return path;
}