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
    const distribution = env.DIST;
    const filename = 'edk-route-verifier.js'; // the problem was here, tests does not work (properly) if output file has min.js extension
    const path     = p.resolve(__dirname, getPath(distribution, inDevelopment));

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

/**
 * This function establish path basing on env vars and mode
 * @param dist
 * @param dev
 * @returns {*}
 */
const getPath = (dist, dev) => {
    let path;
    if(dist && dev) {
        path = 'dist/dev';
    } else if(dist && !dev) {
        path = 'dist/prod';
    } else if(!dist) {
        path = 'server/static/js';
    }
    return path;
}