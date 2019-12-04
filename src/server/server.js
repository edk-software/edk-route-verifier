import bodyParser from 'body-parser';
import cors from 'cors';
import express from 'express';
import logger from 'loglevel';

import { addBrowserRoutes } from './browserRoutes.js';
import { secureServer } from './security.js';
import verifyRoute from '../core/verifyRoute.js';
import RouteVerificationInput from '../data/RouteVerificationInput.js';
import RouteVerificationOptions from '../data/RouteVerificationOptions.js';

function setupLogger(debug) {
    if (debug) {
        logger.setLevel('debug');
    } else {
        logger.setLevel('info');
    }
}

export function startServer(config, port = 9102, language = 'en', debug = false, serveWebContent = false) {
    const app = express();

    if (serveWebContent) {
        addBrowserRoutes(app, config, port);
    } else {
        secureServer(app, config);
    }
    setupLogger(debug);

    app.post('/api/verify', cors(), bodyParser.json(), (req, res) => {
        const { kml } = req.body;

        const routeData = new RouteVerificationInput(kml);
        const verificationOption = new RouteVerificationOptions(config, language, debug);

        verifyRoute(routeData, verificationOption)
            .then(verificationOutput => res.send(verificationOutput))
            .catch(error => {
                logger.error(error);

                return res.status(500).send({
                    message: 'Unexpected internal server error. Check logs.'
                });
            });
    });

    logger.info(`Starting Verify API server...`);

    app.listen(port, () => {
        logger.info(
            `Started serving Verify API ${serveWebContent ? 'and static content ' : ''}at http://localhost:${port}.`
        );
    });
}

export default startServer;
