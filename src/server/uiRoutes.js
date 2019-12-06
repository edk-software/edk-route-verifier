import fs from 'fs';
import path from 'path';
import express from 'express';
import browserify from 'browserify';
import cors from 'cors';
import logger from 'loglevel';

import Configuration from '../core/Configuration.js';

export function addUIRoutes(app, port) {
    const config = Configuration.getConfig();
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

    // static files - javascript
    app.use('/ui/loadMap.js', express.static('src/ui/loadMap.js'));
    app.get('/ui/verifier.js', (req, res) => {
        res.setHeader('Content-Type', 'application/javascript');
        browserify(path.resolve('src/ui/verifier.js'))
            .transform('babelify', { presets: ['@babel/preset-env'] })
            .bundle()
            .pipe(res);
    });

    app.get('/', (req, res) => {
        res.redirect(`/${resources[0]}`);
    });

    // route page
    app.get('/:routeId', (req, res) => {
        const { routeId } = req.params;
        const { googleMapsApiKey } = config;

        res.render('pages/index', {
            googleMapsApiKey,
            routeId,
            serverPort: port,
            resources
        });
    });

    app.get('/kml/:routeId', cors(), (req, res) => {
        const id = req.params.routeId;
        logger.info(`Sending KML for route ${id}.`);
        res.sendFile(path.resolve(path.join(config.resourcesPath, `${id}.kml`)));
    });

    app.get('/config', cors(), (req, res) => {
        res.send(config);
    });
}

export default addUIRoutes;
