var express = require('express');
var request = require('request');
var path = require('path');
var fs = require('fs');
var cors = require('cors');

var app = express();
var port = process.env.PORT || 7777;
var configuration = null;

var displayUsage = () => {
    console.info("Usage: node server.js -c <config.json file path>");
    process.exit(0);
};

process.argv.forEach((val, index) => {
    if (val.toLowerCase() === '-h') {
        displayUsage();
    }

    if (val.toLowerCase() === '-c') {
        if (process.argv[index+1] !== undefined) {
            var configFilePath = process.argv[index+1].toLowerCase();
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
app.use('/static', express.static(__dirname + '/static'));

// index page
app.get('/:routeId', function(req, res) {
    var id = req.params.routeId;
    res.render('pages/index', {
        googleMapsApiKey: configuration.googleMapsApiKey,
        routeId: id,
        serverPort: port
    });
});

app.get('/route-params/:routeId', cors(), function(req, res) {
    var id = req.params.routeId;
    var routeParams = JSON.parse(fs.readFileSync(path.resolve(path.join(configuration.resourcesPath, `${id}_route-params.json`)), 'utf8'));
    console.log(`Sending route ${id} parameters: `, routeParams);
    res.json(routeParams);
});

app.get('/route-approve/:routeId', cors(), function(req, res) {
    var id = req.params.routeId;
    console.log(`Route ${id} approved.`);
    res.send({});
});

app.get('/kml/:routeId', cors(), function(req, res) {
    var id = req.params.routeId;
    console.log(`Sending KML for route ${id}.`);
    res.sendFile(path.resolve(path.join(configuration.resourcesPath, `${id}.kml`)));
});

console.log('Starting proxy server at: http://localhost:' + port);
app.listen(port);