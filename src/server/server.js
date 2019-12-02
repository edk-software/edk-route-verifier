import basicAuth from 'express-basic-auth';
import bodyParser from 'body-parser';
import cors from 'cors';
import helmet from 'helmet';
import express from 'express';
import logger from 'loglevel';

import verifyRoute from '../core/verifyRoute.js';
import RouteVerificationInput from '../data/RouteVerificationInput.js';
import RouteVerificationOptions from '../data/RouteVerificationOptions.js';

function secureServer(app, config) {
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

function setupLogger(debug) {
    if (debug) {
        logger.setLevel('debug');
    } else {
        logger.setLevel('info');
    }
}

// eslint-disable-next-line import/prefer-default-export
export function startServer(config, port = 9102, language = 'en', debug = false) {
    const app = express();

    secureServer(app, config);
    setupLogger(debug);

    app.post('/api/verify', cors(), bodyParser.json(), (req, res) => {
        const { kml, language: l = language, debug: d = debug } = req.body;

        const routeData = new RouteVerificationInput(kml);
        const verificationOption = new RouteVerificationOptions(config, l, d);

        verifyRoute(routeData, verificationOption)
            .then(verificationOutput => res.send(verificationOutput))
            .catch(error => {
                logger.error(error);

                return res.status(500).send({
                    message: 'Unexpected internal server error. Check logs.'
                });
            });
    });

    logger.info(`Starting Verify API server at http://localhost:${port}.`);
    app.listen(port);
}
