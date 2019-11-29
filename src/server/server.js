import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';

import verifyRoute from '../core/verifyRoute.js';
import RouteVerificationInput from '../data/RouteVerificationInput.js';
import RouteVerificationOptions from '../data/RouteVerificationOptions.js';

// eslint-disable-next-line import/prefer-default-export
export function startServer(config, port = 9102, language = 'en', debug = false) {
    const app = express();

    app.post('/api/verify', cors(), bodyParser.json(), (req, res) => {
        const { kmlFile, language: l = language, debug: d = debug } = req.body;

        const routeData = new RouteVerificationInput(kmlFile);
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

    console.log(`Starting server at http://localhost:${port}.`);
    app.listen(port);
}
