import logger from 'loglevel';

import LogBuffer from './utils/LogBuffer.js';
import helpers from './utils/helpers.js';
import Route from './Route.js';

import RouteVerificationOptions from '../data/RouteVerificationOptions.js';
import RouteVerificationInput from '../data/RouteVerificationInput.js';
import RouteVerificationOutput from '../data/RouteVerificationOutput.js';
import InvalidInputError from './errors/InvalidInputError.js';
import KMLError from './errors/KMLError.js';

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
    const logBuffer = new LogBuffer();
    logBuffer.cleanLogs();
    if (options.debug) {
        logger.setLevel('debug');
    } else {
        logger.setLevel('info');
    }

    const verificationOutput = new RouteVerificationOutput();
    let route = null;

    return new Promise((resolve, reject) => {
        if (!(input instanceof RouteVerificationInput)) {
            return reject(
                new InvalidInputError("Invalid type of 'input' argument passed to verifyRoute function.", input)
            );
        }
        if (!(options instanceof RouteVerificationOptions)) {
            return reject(
                new InvalidInputError("Invalid type of 'options' argument passed to verifyRoute function.", options)
            );
        }

        let geoJson = null;
        try {
            geoJson = helpers.getGeoJSON(input.kml);
        } catch (error) {
            if (error instanceof KMLError) {
                return reject(error);
            }
            return reject(new Error('Cannot parse KML to GeoJSON'));
        }
        route = new Route(geoJson);

        return resolve(route.fetchData());
    })
        .then(pathElevation => {
            // Path basic checks
            verificationOutput.setSinglePath(route.isSinglePath());
            verificationOutput.setPathLength(route.getLength());

            // Route Type calculation
            verificationOutput.setRouteType(route.isTypeValid(), route.getType());

            // Station checks
            verificationOutput.setNumberOfStations(route.areAllStationsPresent());
            verificationOutput.setStationsOrder(route.isStationOrderCorrect());
            verificationOutput.setStationsOnPath(route.areStationsOnThePath());

            // Elevations calculation
            verificationOutput.setElevationGain(pathElevation.gain);
            verificationOutput.setElevationLoss(pathElevation.loss);
            verificationOutput.setElevationTotalChange(pathElevation.totalChange);

            // Route characteristics
            verificationOutput.setElevationCharacteristics(pathElevation.getData());
            verificationOutput.setPathStart(route.getPathStart());
            verificationOutput.setPathEnd(route.getPathEnd());
            verificationOutput.setStations(route.getStations());

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
            return Promise.reject(error);
        });
}
