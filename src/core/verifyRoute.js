import logger from 'loglevel';

import Configuration from './Configuration.js';
import LogBuffer from './utils/LogBuffer.js';
import Lang from './lang/Lang.js';
import helpers from './utils/helpers.js';
import Route from './Route.js';

import RouteVerificationOptions from '../data/input/RouteVerificationOptions.js';
import RouteVerificationInput from '../data/input/RouteVerificationInput.js';
import RouteVerificationOutput from '../data/output/RouteVerificationOutput.js';

export default function verifyRoute(routeData, verificationOption) {
    if (!(routeData instanceof RouteVerificationInput)) {
        throw Error('Invalid type of first argument passed to verifyRoute function.');
    }
    if (!(verificationOption instanceof RouteVerificationOptions)) {
        throw Error('Invalid type of second argument passed to verifyRoute function.');
    }

    const config = new Configuration(verificationOption.config);
    const lang = new Lang(verificationOption.language);
    const logBuffer = new LogBuffer();
    logBuffer.cleanLogs();

    const verificationOutput = new RouteVerificationOutput();
    const parameters = routeData.routeParams;
    const geoJson = helpers.getGeoJSON(routeData.kml);
    const route = new Route(geoJson);

    if (!route.isVerifiable()) {
        return Promise.reject('Route is unverifiable');
    }

    // Path basic checks
    verificationOutput.setSinglePath(route.isSinglePath());
    const routeLength = route.getPathLength();
    verificationOutput.setPathLength(true, routeLength);

    // Station checks
    verificationOutput.setNumberOfStations(route.areAllStationsPresent());
    verificationOutput.setStationsOrder(route.isStationOrderCorrect());
    verificationOutput.setStationsOnPath(route.areStationsOnThePath());

    return route.fetchPathElevationData()
        .then(() => {
            const pathElevation = route.getPathElevation();
            pathElevation.enrichData(routeLength);
            verificationOutput.setElevationCharacteristics(pathElevation.getData());
            // logger.debug('pathElevation:', pathElevation);

            verificationOutput.setElevationGain(true, pathElevation.gain);
            verificationOutput.setElevationLoss(true, pathElevation.loss);
            verificationOutput.setElevationTotalChange(true, pathElevation.totalChange);

            // Calculate route type
            const NORMAL_ROUTE_MIN_LENGTH = 40; // kilometers
            const SHORT_NORMAL_ROUTE_MIN_LENGTH = 30; // kilometers
            const SHORT_NORMAL_ROUTE_MIN_ELEVATION_GAIN = 500; // meters
            const isNormalRoute = routeLength >= NORMAL_ROUTE_MIN_LENGTH
            || pathElevation.gain > SHORT_NORMAL_ROUTE_MIN_ELEVATION_GAIN
            && routeLength >= SHORT_NORMAL_ROUTE_MIN_LENGTH;
            verificationOutput.setRouteType(isNormalRoute);

            // Calculate data consistency
            const ACCEPTED_ROUTE_LENGTH_DIFF = 1; // km
            const ACCEPTED_ELEVATION_GAIN_DIFF = 50; // m
            const NORMAL_ROUTE_TYPE = 0;
            const INSPIRED_ROUTE_TYPE = 1;
            const isLengthConsistent = (routeLength - ACCEPTED_ROUTE_LENGTH_DIFF <= parameters.length
            && parameters.length <= routeLength + ACCEPTED_ROUTE_LENGTH_DIFF);
            const isElevationGainConsistent = (pathElevation.gain - ACCEPTED_ELEVATION_GAIN_DIFF <= parameters.ascent
            && parameters.ascent <= pathElevation.gain + ACCEPTED_ELEVATION_GAIN_DIFF);
            const isRouteTypeConsistent = parameters.type === (isNormalRoute ? NORMAL_ROUTE_TYPE : INSPIRED_ROUTE_TYPE);
            if (!isElevationGainConsistent) {
                logBuffer.add(lang.trans("Route parameter 'ascent' not consistent",
                    { expected: parameters.ascent, calculated: pathElevation.gain.toFixed(2) }));
            }
            if (!isLengthConsistent) {
                logBuffer.add(lang.trans("Route parameter 'length' not consistent",
                    { expected: parameters.length, calculated: routeLength.toFixed(2) }));
            }
            if (!isRouteTypeConsistent) {
                const calculated = isNormalRoute ? NORMAL_ROUTE_TYPE : INSPIRED_ROUTE_TYPE;
                logBuffer.add(lang.trans("Route parameter 'type' not consistent",
                    { expected: parameters.type, calculated }));
            }
            const dataConsistency = isLengthConsistent && isElevationGainConsistent && isRouteTypeConsistent;
            verificationOutput.setDataConsistency(dataConsistency);

            // Sending status
            const routeSuccessfullyVerified = verificationOutput.getStatus();
            if (routeSuccessfullyVerified) {
                logger.info('Route verification succeeded.');
                return verificationOutput.getObject();
            }
            return Promise.reject('Route verification failed');
        })
        .catch(error => {
            logBuffer.add(lang.trans(error));
            verificationOutput.setLogs(logBuffer.getLogs());
            return verificationOutput.getObject();
        });
}

if (process.env.NODE_ENV === 'production') {
    logger.setLevel('warn');
} else {
    logger.setLevel('info');
}
