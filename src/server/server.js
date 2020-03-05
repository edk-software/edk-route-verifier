import bodyParser from 'body-parser';
import cors from 'cors';
import express from 'express';
import fs from 'fs';
import logger from 'loglevel';
import path from 'path';
import { isEmpty } from '../core/utils/lodash.js';
import Configuration from '../core/Configuration.js';
import FileError from '../core/errors/FileError.js';

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

function getKmlString(kml, file) {
    let kmlString = null;

    if (!isEmpty(kml)) {
        logger.debug('Getting KML string directly from request.');
        kmlString = kml;
    } else if (!isEmpty(file)) {
        logger.debug('Getting KML string from file.');
        const config = Configuration.getConfig();
        const resourcesPath = path.resolve(config.resourcesPath);
        const kmlFilePath = path.resolve(resourcesPath, file);

        if (!kmlFilePath.startsWith(resourcesPath)) {
            throw new FileError(file, 'No access to files outside of resources path');
        }

        if (!fs.existsSync(kmlFilePath)) {
            throw new FileError(file, 'File does not exist in resources path');
        }

        try {
            logger.debug(`Getting KML string from file: ${file}`);
            kmlString = fs.readFileSync(kmlFilePath, 'utf8');
        } catch (error) {
            throw new FileError(file, 'Error during accessing file');
        }
    } else {
        throw new FileError(file, 'Request parameters not provided');
    }

    return kmlString;
}

export function createServer(port, debug, serveWebContent) {
    const app = express();

    if (serveWebContent) {
        addUIRoutes(app, port);
    } else {
        secureServer(app);
    }
    setupLogger(debug);

    app.post('/api/verify', cors(), bodyParser.json({ limit: '10mb' }), (req, res) => {
        const { kml, file } = req.body;

        let kmlString = null;
        try {
            kmlString = getKmlString(kml, file);
        } catch (error) {
            logger.error(error);
            return ServerAdapter.handleError(error, res);
        }

        const routeData = new RouteVerificationInput(kmlString);
        const verificationOption = new RouteVerificationOptions(debug);

        verifyRoute(routeData, verificationOption, new ServerAdapter())
            .then(output => res.send(output.get()))
            .catch(error => {
                logger.error(error);
                return ServerAdapter.handleError(error, res);
            });
    });

    return app;
}

export function startServer(port, debug, serveWebContent) {
    const app = createServer(port, debug, serveWebContent);

    logger.info(`Starting Verify API server...`);

    return app.listen(port, () => {
        logger.info(
            `Started serving Verify API ${serveWebContent ? 'and static content ' : ''}at http://localhost:${port}.`
        );
    });
}
