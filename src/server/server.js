import bodyParser from 'body-parser';
import cors from 'cors';
import express from 'express';
import logger from 'loglevel';

import { addUIRoutes } from './uiRoutes.js';
import { secureServer } from './security.js';
import verifyRoute from '../core/verifyRoute.js';
import RouteVerificationInput from '../data/RouteVerificationInput.js';
import RouteVerificationOptions from '../data/RouteVerificationOptions.js';
import ServerAdapter from './ServerAdapter.js';

function setupLogger(debug) {
    if (debug) {
        logger.setLevel('debug');
    } else {
        logger.setLevel('info');
    }
}

export function startServer(port, debug, serveWebContent, addStopEndpoint = false) {
    const app = express();

    if (serveWebContent) {
        addUIRoutes(app, port);
    } else {
        secureServer(app);
    }
    setupLogger(debug);

    if (addStopEndpoint) {
        app.post('/stop', (req, res) => app.close().then(() => res.send()));
    }

    app.post('/api/verify', cors(), bodyParser.json(), (req, res) => {
        const { kml } = req.body;

        const routeData = new RouteVerificationInput(kml);
        const verificationOption = new RouteVerificationOptions(debug);

        verifyRoute(routeData, verificationOption, new ServerAdapter())
            .then(output => res.send(output.get()))
            .catch(error => {
                logger.error(error);
                return ServerAdapter.handleError(error, res);
            });
    });

    logger.info(`Starting Verify API server...`);

    return app.listen(port, () => {
        logger.info(
            `Started serving Verify API ${serveWebContent ? 'and static content ' : ''}at http://localhost:${port}.`
        );
    });
}

export default startServer;
