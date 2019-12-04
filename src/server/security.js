import helmet from 'helmet';
import basicAuth from 'express-basic-auth';
import logger from 'loglevel';

export function secureServer(app, config) {
    app.use(helmet());

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
