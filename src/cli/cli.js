#!/usr/bin/env node --experimental-modules --experimental-json-modules

import { readFileSync } from 'fs';
import yargs from 'yargs';

import RouteVerificationInput from '../data/RouteVerificationInput.js';
import RouteVerificationOptions from '../data/RouteVerificationOptions.js';
import verifyRoute from '../core/verifyRoute.js';
import { startServer } from '../server/server.js';

const { argv } = yargs
    .scriptName('edk-route-verifier')
    .usage('Usage: $0 <command> -c <config-file> [options]')
    .command('server [options] [-p port]', 'Starts server providing verification API', y =>
        y.option('port', {
            alias: 'p',
            describe: 'API server port',
            type: 'number'
        })
    )
    .command('file [options] <kml>', 'Verify provided KML file', y =>
        y.positional('kml', {
            describe: 'KML file path',
            type: 'string',
            coerce: kmlFile => readFileSync(kmlFile, 'utf8')
        })
    )
    .command('browser', 'Run browser version of the verifer')
    .demandCommand(
        1,
        1,
        'You need exactly one command before moving on',
        'You need exactly one command before moving on'
    )
    .option('c', {
        alias: 'config',
        describe: 'Configuration JSON file path (should contain googleMapsApiKey)',
        type: 'string',
        coerce: arg => JSON.parse(readFileSync(arg, 'utf8'))
    })
    .option('l', {
        alias: 'language',
        default: 'en',
        describe: 'Logs language',
        choices: ['en', 'pl']
    })
    .option('d', {
        alias: 'debug',
        default: false,
        describe: 'Include debugging data',
        type: 'boolean'
    })
    .demandOption('c', 'Please provide configuration file path.')
    .example('$0 server -c config.json -p 9102', 'starts API server on port 9102')
    .example('$0 file -c config.json my_route.kml', 'verifies my_route.kml')
    .example(
        '$0 file -c config.json -l pl -d my_route.kml',
        'verifies my_route.kml and provides debug information in Polish language'
    )
    .example('$0 browser', 'starts API and static web content server')
    .alias('v', 'version')
    .help('h')
    .alias('h', 'help')
    .wrap(Math.min(120, yargs.terminalWidth()));

const commands = argv._;
const { config, language, debug } = argv;

if (commands.includes('server')) {
    const { port } = argv;
    startServer(config, port, language, debug, false);
} else if (commands.includes('file')) {
    const { kml } = argv;

    const routeInput = new RouteVerificationInput(kml);
    const options = new RouteVerificationOptions(config, language, debug);

    verifyRoute(routeInput, options).then(data => console.log(data));
} else if (commands.includes('browser')) {
    const { port } = argv;

    startServer(config, port, language, debug, true);
}
