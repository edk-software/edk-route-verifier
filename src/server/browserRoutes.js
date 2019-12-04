import fs from 'fs';
import path from 'path';
import express from 'express';
import browserify from 'browserify';
import cors from 'cors';
import logger from 'loglevel';

export function addBrowserRoutes(app, config, port) {
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
}

export default addBrowserRoutes;
