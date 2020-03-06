#!/usr/bin/env node --no-warnings --experimental-modules --experimental-json-modules

import { readFileSync, existsSync } from 'fs';
import { resolve } from 'path';

import yargs from 'yargs';

import RouteVerificationInput from '../data/RouteVerificationInput.js';
import RouteVerificationOptions from '../data/RouteVerificationOptions.js';
import FileError from '../core/errors/FileError.js';
import verifyRoute from '../core/verifyRoute.js';
import { startServer } from '../server/server.js';
import CLIAdapter from './CLIAdapter.js';
import Configuration from '../core/Configuration.js';
import Lang from '../core/lang/Lang.js';

const addPortOption = y =>
    y.option('port', {
        alias: 'p',
        default: 9102,
        describe: 'API server port',
        type: 'number'
    });

const { argv } = yargs
    .scriptName('edk-route-verifier')
    .usage('Usage: $0 <command> -c <config-file> [options]')
    .command('server [options] [-p port]', 'Starts server providing verification API', addPortOption)
    .command('file [options] <kml>', 'Verify provided KML file', y =>
        y.positional('kml', {
            describe: 'KML file path (can be relative to resourcesPath from configuration file)',
            type: 'string'
        })
    )
    .command('ui [options]', 'Run UI version of the verifer', addPortOption)
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
    .example('$0 ui -c config.json', 'starts API and static web content server')
    .alias('v', 'version')
    .help('h')
    .alias('h', 'help')
    .wrap(Math.min(120, yargs.terminalWidth()));

const commands = argv._;
const { config, language, debug } = argv;

// eslint-disable-next-line no-unused-vars
const configuration = new Configuration(config);
// eslint-disable-next-line no-unused-vars
const lang = new Lang(language);

const getKmlString = kml => {
    const configInstance = Configuration.getConfig();
    const resourcesPath = resolve(configInstance.resourcesPath);
    const kmlFileFromResourcesPath = resolve(resourcesPath, kml);
    const kmlFileWithoutBaseDir = resolve(kml);
    let kmlString = null;

    if (existsSync(kmlFileFromResourcesPath)) {
        kmlString = readFileSync(kmlFileFromResourcesPath, 'utf8');
    } else if (existsSync(kmlFileWithoutBaseDir)) {
        kmlString = readFileSync(kmlFileWithoutBaseDir, 'utf8');
    }

    return kmlString;
};

if (commands.includes('server')) {
    const { port } = argv;

    startServer(port, debug, false);
} else if (commands.includes('file')) {
    const { kml } = argv;
    const kmlString = getKmlString(kml);

    if (kmlString !== null) {
        const routeInput = new RouteVerificationInput(kmlString);
        const options = new RouteVerificationOptions(debug);

        verifyRoute(routeInput, options, new CLIAdapter())
            .then(output => output.get())
            .catch(error => CLIAdapter.handleError(error));
    } else {
        CLIAdapter.handleError(new FileError('kml', 'TODO'));
    }
} else if (commands.includes('ui')) {
    const { port } = argv;

    startServer(port, debug, true);
}
