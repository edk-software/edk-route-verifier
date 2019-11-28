import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';

import verifyRoute from '../core/verifyRoute.js';
import RouteVerificationInput from '../data/input/RouteVerificationInput.js';
import RouteParameters from '../data/input/RouteParameters.js';
import RouteVerificationOptions from '../data/input/RouteVerificationOptions.js';

// eslint-disable-next-line import/prefer-default-export
export function startServer(port = 9102, language = 'en', debug = false) {
    const app = express();

    app.post('/api/verify', cors(), bodyParser.json(), (req, res) => {
        const {
            ascent, kmlFile, length, type,
        } = req.body;

        const routeData = new RouteVerificationInput(kmlFile, new RouteParameters(ascent, length, type));
        const verificationOption = new RouteVerificationOptions(language, debug);

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
