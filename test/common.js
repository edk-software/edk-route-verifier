import request from 'request-promise-native';
import { readFileSync } from 'fs';
import { join } from 'path';
import RouteVerificationInput from '../src/data/RouteVerificationInput';
import RouteVerificationOptions from '../src/data/RouteVerificationOptions';
import verifyRoute from '../src/core/verifyRoute';
import ServerAdapter from '../src/server/ServerAdapter';
import Configuration from '../src/core/Configuration';
import Lang from '../src/core/lang/Lang';
import { startServer } from '../src/server/server';

const testServerPort = 9103;

export function readFile(name) {
    return readFileSync(name, 'utf8');
}

export function readJsonFile(name) {
    return JSON.parse(readFile(name));
}

export function readKmlFile(name) {
    const kmlFilesPath = './test/resources';
    const kmlFilesExtension = '.kml';
    return readFile(join(kmlFilesPath, `${name}${kmlFilesExtension}`), 'utf8');
}

export function stopAPIServer() {
    return request.post({
        method: 'POST',
        uri: `http://localhost:${testServerPort}/stop`
    });
}

export function startAPIServer() {
    return startServer(testServerPort, false, false, true);
}

export function callVerifyApi(kml, { apiUser, apiPass } = readJsonFile('./conf/config.json')) {
    return request.post({
        method: 'POST',
        uri: `http://localhost:${testServerPort}/api/verify`,
        body: { kml },
        auth: {
            user: apiUser,
            pass: apiPass
        },
        json: true
    });
}

export async function getVerificationOutputFor(filename) {
    const kml = readKmlFile(filename);
    const routeInput = new RouteVerificationInput(kml);
    const options = new RouteVerificationOptions(false);

    const verificationOutput = await verifyRoute(routeInput, options, new ServerAdapter());

    return verificationOutput.get();
}

export function initializeVerificationEnvironment(config = readJsonFile('./conf/config.json'), language = 'en') {
    // eslint-disable-next-line no-unused-vars
    const configuration = new Configuration(config);
    // eslint-disable-next-line no-unused-vars
    const lang = new Lang(language);
}

expect.extend({
    toBeWithinRange(received, rangeSize) {
        const floor = received - rangeSize / 2;
        const ceiling = received + rangeSize / 2;
        const pass = received >= floor && received <= ceiling;
        if (pass) {
            return {
                message: () => `expected ${received} not to be within range ${floor} - ${ceiling}`,
                pass: true
            };
        }
        return {
            message: () => `expected ${received} to be within range ${floor} - ${ceiling}`,
            pass: false
        };
    }
});
