import helmet from 'helmet';
import basicAuth from 'express-basic-auth';
import logger from 'loglevel';
import Configuration from '../core/Configuration.js';

export function secureServer(app) {
    app.use(helmet());

    const config = Configuration.getConfig();
    const { apiUser, apiPass } = config;
    if (apiUser && apiPass) {
        app.use(
            basicAuth({
                users: { [apiUser]: apiPass }
            })
        );
    } else {
        logger.warn(
            'Server API username/password not defined in the configuration. ' +
                'Starting server without Basic Authentication.'
        );
    }
}

export default secureServer;
