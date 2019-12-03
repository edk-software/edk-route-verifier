import browserify from 'browserify';
import basicAuth from 'express-basic-auth';
import bodyParser from 'body-parser';
import cors from 'cors';
import helmet from 'helmet';
import express from 'express';
import fs from 'fs';
import logger from 'loglevel';
import path from 'path';

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

function addStaticRoutes(app, config, port) {
    const languagesPath = path.resolve('src/core/lang');
    const languages = fs
        .readdirSync(languagesPath)
        .filter(file => file.endsWith('.json'))
        .map(file => file.replace('.json', ''));
    const resources = [];
    fs.readdirSync(path.resolve(config.resourcesPath)).forEach(file => {
        if (file.search(/\.kml$/i) >= 0) {
            resources.push(file.replace('.kml', ''));
        }
    });

    // set the view engine to ejs
    app.set('views', path.resolve('src/server'));
    app.set('view engine', 'ejs');
    app.use('/pages', express.static('src/server/pages'));
    app.use('/browser/loadMap.js', express.static('src/browser/loadMap.js'));
    app.get('/browser/verifier.js', (req, res) => {
        res.setHeader('Content-Type', 'application/javascript');
        browserify(path.resolve('src/browser/verifier.js'))
            .transform('babelify', { presets: ['@babel/preset-env'] })
            .bundle()
            .pipe(res);
    });

    // all resources page
    app.get('/resources', (req, res) => {
        res.render('pages/resources', {
            resources
        });
    });

    app.get('/', (req, res) => {
        res.redirect('/resources');
    });

    // index page
    app.get('/:routeId', (req, res) => {
        const id = req.params.routeId;
        const { lang = 'pl' } = req.query;
        res.render('pages/index', {
            googleMapsApiKey: config.googleMapsApiKey,
            routeId: id,
            serverPort: port,
            language: lang,
            languages,
            resources
        });
    });

    app.get('/kml/:routeId', cors(), (req, res) => {
        const id = req.params.routeId;
        logger.info(`Sending KML for route ${id}.`);
        res.sendFile(path.resolve(path.join(config.resourcesPath, `${id}.kml`)));
    });
}

// eslint-disable-next-line import/prefer-default-export
export function startServer(config, port = 9102, language = 'en', debug = false, serveWebContent = false) {
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

    if (serveWebContent) {
        addStaticRoutes(app, config, port);
        logger.info(`Open browser at http://localhost:${port}.`);
    } else {
        logger.info(`Starting Verify API server at http://localhost:${port}.`);
    }

    app.listen(port);
}
