import logger from 'loglevel';

import Configuration from './Configuration.js';
import LogBuffer from './utils/LogBuffer.js';
import Lang from './lang/Lang.js';
import helpers from './utils/helpers.js';
import Route from './Route.js';

import RouteVerificationOptions from '../data/RouteVerificationOptions.js';
import RouteVerificationInput from '../data/RouteVerificationInput.js';
import RouteVerificationOutput from '../data/RouteVerificationOutput.js';

/**
 * Verifies KML route
 *
 * @param input RouteVerificationInput
 * @param options RouteVerificationOptions
 * @param adapter AbstractAdapter
 *
 * @return Promise
 */
export default function verifyRoute(input, options, adapter) {
    if (!(input instanceof RouteVerificationInput)) {
        throw Error('Invalid type of first argument passed to verifyRoute function.');
    }
    if (!(options instanceof RouteVerificationOptions)) {
        throw Error('Invalid type of second argument passed to verifyRoute function.');
    }

    // Creating singleton Configuration and Lang instances
    // eslint-disable-next-line no-unused-vars
    const config = new Configuration(options.config);
    // eslint-disable-next-line no-unused-vars
    const lang = new Lang(options.language);

    const logBuffer = new LogBuffer();
    logBuffer.cleanLogs();
    if (options.debug) {
        logger.setLevel('debug');
    } else {
        logger.setLevel('info');
    }

    const verificationOutput = new RouteVerificationOutput();
    const geoJson = helpers.getGeoJSON(input.kml);
    const route = new Route(geoJson);

    return route
        .fetchData()
        .then(pathElevation => {
            // Path basic checks
            verificationOutput.setSinglePath(route.isSinglePath());
            verificationOutput.setPathLength(route.getLength());

            // Station checks
            verificationOutput.setNumberOfStations(route.areAllStationsPresent());
            verificationOutput.setStationsOrder(route.isStationOrderCorrect());
            verificationOutput.setStationsOnPath(route.areStationsOnThePath());

            // Elevations calculation
            verificationOutput.setElevationCharacteristics(pathElevation.getData());
            verificationOutput.setElevationGain(pathElevation.gain);
            verificationOutput.setElevationLoss(pathElevation.loss);
            verificationOutput.setElevationTotalChange(pathElevation.totalChange);

            // Route Type calculation
            verificationOutput.setRouteType(route.isTypeValid(), route.getType());

            // Sending status
            const routeSuccessfullyVerified = verificationOutput.getStatus();
            if (routeSuccessfullyVerified) {
                logger.debug('Route verification succeeded.');
                adapter.init(verificationOutput);
                return adapter;
            }

            logger.debug('Route verification failed.');
            verificationOutput.setLogs(logBuffer.getLogs());
            adapter.init(verificationOutput);
            return adapter;
        })
        .catch(error => {
            logger.error(`Error during verification. ${error}`);

            verificationOutput.setLogs(logBuffer.getLogs());
            adapter.init(verificationOutput);
            return adapter;
        });
}
