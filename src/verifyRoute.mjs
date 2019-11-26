import logger from 'loglevel';

import LogBuffer from './utils/LogBuffer.js';
import Lang from './lang/Lang.js';
import helpers from './utils/helpers.js';
import Route from './Route.js';

import RouteVerificationOptions from './input/RouteVerificationOptions.mjs';
import RouteVerificationInput from './input/RouteVerificationInput.mjs';
import RouteVerificationOutput from './output/RouteVerificationOutput.mjs';

export default function verifyRoute(routeData, verificationOption) {
    if (!(routeData instanceof RouteVerificationInput)) {
        throw Error('Invalid type of first argument passed to verifyRoute function.');
    }
    if (!(verificationOption instanceof RouteVerificationOptions)) {
        throw Error('Invalid type of second argument passed to verifyRoute function.');
    }

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
    // logger.debug('isSinglePath:', isSinglePath);
    const routeLength = route.getPathLength();
    verificationOutput.setPathLength(true, routeLength);
    // logger.debug('routeLength:', routeLength);

    // Station checks
    verificationOutput.setNumberOfStations(route.areAllStationsPresent());
    // logger.debug('areAllStationsPresent:', areAllStationsPresent);
    verificationOutput.setStationsOrder(route.isStationOrderCorrect());
    // logger.debug('isStationOrderCorrect:', isStationOrderCorrect);
    verificationOutput.setStationsOnPath(route.areStationsOnThePath());
    // logger.debug('areStationsOnThePath:', areStationsOnThePath);

    route.fetchPathElevationData()
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
            // logger.debug('isNormalRoute:', isNormalRoute);
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
            verificationOutput.setDataConsistency(isLengthConsistent && isElevationGainConsistent && isRouteTypeConsistent);
            logger.debug('isLengthConsistent:', isLengthConsistent,
                ', isElevationGainConsistent:', isElevationGainConsistent,
                ', isRouteTypeConsistent:', isRouteTypeConsistent);
        })
        .catch(error => {
            logBuffer.add(lang.trans(error));
        })
        .finally(() => {
            const routeSuccessfullyVerified = verificationOutput.getStatus();

            if (routeSuccessfullyVerified) {
                logger.info('Route verification succeeded.');
            } else {
                logger.info('Route verification failed.');
                console.log(logBuffer.getLogs());
            }

            console.log(verificationOutput.getObject());
        });
}

if (process.env.NODE_ENV === 'production') {
    logger.setLevel('warn');
} else {
    logger.setLevel('info');
}
