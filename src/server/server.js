import bodyParser from 'body-parser';
import cors from 'cors';
import express from 'express';
import logger from 'loglevel';

import verifyRoute from '../core/verifyRoute.js';
import RouteVerificationInput from '../data/RouteVerificationInput.js';
import RouteVerificationOptions from '../data/RouteVerificationOptions.js';

// eslint-disable-next-line import/prefer-default-export
export function startServer(config, port = 9102, language = 'en', debug = false) {
    const app = express();

    app.post('/api/verify', cors(), bodyParser.json(), (req, res) => {
        const { kml, language: l = language, debug: d = debug } = req.body;

        const routeData = new RouteVerificationInput(kml);
        const verificationOption = new RouteVerificationOptions(config, l, d);

        verifyRoute(routeData, verificationOption)
            .then(verificationOutput => {
                res.send(verificationOutput);
            })
            .catch(error => {
                // TODO handle errors
                res.send({});
            });
    });

    // TODO block other endpoints

    if (debug) {
        logger.setLevel('debug');
    } else {
        logger.setLevel('info');
    }

    logger.info(`Starting server at http://localhost:${port}.`);
    app.listen(port);
}
