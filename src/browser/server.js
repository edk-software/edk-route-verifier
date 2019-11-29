/*
const express = require('express');
const path = require('path');
const fs = require('fs');
const cors = require('cors');

const app = express();
const port = process.env.PORT || 7777;
const isProduction = process.env.NODE_ENV === 'production';
const jsFilename = isProduction ? 'edk-route-verifier.min.js' : 'edk-route-verifier.js';
const languagesPath = path.resolve('../src/lang');
const languages = fs.readdirSync(languagesPath)
    .filter(file => file.endsWith('.json'))
    .map(file => file.replace('.json', ''));
let configuration = null;

const displayUsage = () => {
    console.info('Usage: node server.js -c <config.json file path>');
    process.exit(0);
};

process.argv.forEach((val, index) => {
    if (val.toLowerCase() === '-h') {
        displayUsage();
    }

    if (val.toLowerCase() === '-c') {
        if (process.argv[index + 1] !== undefined) {
            const configFilePath = process.argv[index + 1].toLowerCase();
            try {
                configuration = require(path.resolve(configFilePath));
            } catch (error) {
                console.error(error);
                displayUsage();
            }
        } else {
            console.error('Error: Invalid path specified');
            displayUsage();
        }
    }
});

if (configuration === null) {
    console.error('Error: You must specify config.json file path');
    displayUsage();
}

// set the view engine to ejs
app.set('view engine', 'ejs');
app.use('/static', express.static(`${__dirname}/static`));

// all resources page
app.get('/resources', (req, res) => {
    const resources = [];
    fs.readdirSync(path.resolve(configuration.resourcesPath)).forEach(file => {
        if (file.search(/\.kml$/i) >= 0) {
            resources.push(file.replace('.kml', ''));
        }
    });
    res.render('pages/resources', {
        resources,
    });
});

app.get('/', (req, res) => {
    res.redirect('/resources');
});

// index page
app.get('/:routeId', (req, res) => {
    const id = req.params.routeId;
    const lang = req.query.lang;
    res.render('pages/index', {
        googleMapsApiKey: configuration.googleMapsApiKey,
        routeId: id,
        serverPort: port,
        jsFilename,
        language: lang,
        languages,
    });
});

app.get('/kml/:routeId', cors(), (req, res) => {
    const id = req.params.routeId;
    console.log(`Sending KML for route ${id}.`);
    res.sendFile(path.resolve(path.join(configuration.resourcesPath, `${id}.kml`)));
});

const bundlePath = path.resolve(`${__dirname}/static/js/${jsFilename}`);
if (fs.existsSync(bundlePath)) {
    const mode = isProduction ? 'production' : 'development';
    console.log(`Starting proxy server in ${mode} mode at: http://localhost:${port}`);
    console.log(`Using testing bundle file: ${bundlePath}.`);
    app.listen(port);
} else {
    console.error(`Testing bundle not present. Expecting: ${bundlePath} to be present.`);
}
 */
