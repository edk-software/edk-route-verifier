import logger from 'loglevel';

import LogBuffer from './utils/LogBuffer';
import Context from './Context';
import Lang from './lang/Lang';
import Controls from './Controls';
import helpers from './utils/helpers';
import Route from './Route';

// Constants
const NORMAL_ROUTE_MIN_LENGTH = 40; // kilometers
const SHORT_NORMAL_ROUTE_MIN_LENGTH = 30; // kilometers
const SHORT_NORMAL_ROUTE_MIN_ELEVATION_GAIN = 500; // meters

// Google Maps API loading and key validation
window.GOOGLE_MAPS_API_LOADED = true;
window.gm_authFailure = () => { window.GOOGLE_MAPS_API_LOADED = false; };

function verifyRoute() {
    if (!window.GOOGLE_MAPS_API_LOADED || !window.google || !window.google.maps) {
        window.GOOGLE_MAPS_API_LOADED = false;
        logger.error('Google Maps API is not loaded. Verification cannot be done.');
    }

    const context = new Context();
    const controls = new Controls();
    const lang = new Lang(context.language);
    const logBuffer = new LogBuffer();

    let routeSuccessfullyVerified = false;
    let route = null;
    let routeLength = 0;
    let pathElevation = null;

    let isSinglePath = false;
    let isPathLengthValid = false;
    let isNormalRoute = false;
    let areAllStationsPresent = false;
    let isStationOrderCorrect = false;
    let areStationsOnThePath = false;
    let isPathElevationGainValid = false;
    let isPathElevationLossValid = false;
    let isPathElevationTotalChangeValid = false;
    let isDataConsistent = false;

    controls.resetAll();
    logBuffer.cleanLogs();
    controls.addLoaderToButton();

    helpers.getRoute(context.routeUrl)
        .then(data => {
            const geoJson = helpers.getGeoJSON(data);
            route = new Route(geoJson);

            if (!route.isVerifiable()) {
                controls.resetAll(false);
                return Promise.reject('Route is unverifiable');
            }

            // Path basic checks
            isSinglePath = route.isSinglePath();
            controls.updateSinglePath(isSinglePath);
            routeLength = route.getPathLength();
            isPathLengthValid = true;
            controls.updatePathLength(isPathLengthValid, routeLength);

            // Station checks
            areAllStationsPresent = route.areAllStationsPresent();
            controls.updateNumberOfStations(areAllStationsPresent);
            isStationOrderCorrect = route.isStationOrderCorrect();
            controls.updateStationsOrder(isStationOrderCorrect);
            areStationsOnThePath = route.areStationsOnThePath();
            controls.updateStationsOnPath(areStationsOnThePath);
        })
        .then(() => route.fetchPathElevationData())
        .then(() => {
            pathElevation = route.getPathElevation();
            pathElevation.enrichData(routeLength);

            isPathElevationGainValid = true;
            controls.updateElevationGain(isPathElevationGainValid, pathElevation.gain);

            isNormalRoute = routeLength >= NORMAL_ROUTE_MIN_LENGTH
                || pathElevation.gain > SHORT_NORMAL_ROUTE_MIN_ELEVATION_GAIN
                && routeLength >= SHORT_NORMAL_ROUTE_MIN_LENGTH;
            controls.updateRouteType(isNormalRoute);

            isPathElevationLossValid = true;
            controls.updateElevationLoss(isPathElevationLossValid, pathElevation.loss);

            isPathElevationTotalChangeValid = true;
            controls.updateElevationTotalChange(isPathElevationTotalChangeValid,
                pathElevation.totalChange);

            controls.drawElevationChart(pathElevation);
        })
        .then(() => helpers.getRouteParameters(context.routeParamsUrl))
        .then(parameters => {
            const ACCEPTED_ROUTE_LENGTH_DIFF = 1; // km
            const ACCEPTED_ELEVATION_GAIN_DIFF = 50; // m
            const NORMAL_ROUTE_TYPE = 0;
            const INSPIRED_ROUTE_TYPE = 1;
            /* eslint-disable max-len */
            const isLengthConsistent = (routeLength - ACCEPTED_ROUTE_LENGTH_DIFF <= parameters.length
                && parameters.length <= routeLength + ACCEPTED_ROUTE_LENGTH_DIFF);
            const isElevationGainConsistent = (pathElevation.gain - ACCEPTED_ELEVATION_GAIN_DIFF <= parameters.ascent
                && parameters.ascent <= pathElevation.gain + ACCEPTED_ELEVATION_GAIN_DIFF);
            const isRouteTypeConsistent = parameters.type === (isNormalRoute ? NORMAL_ROUTE_TYPE : INSPIRED_ROUTE_TYPE);
            isDataConsistent = isLengthConsistent && isElevationGainConsistent && isRouteTypeConsistent;

            logger.debug('isLengthConsistent:', isLengthConsistent,
                ', isElevationGainConsistent:', isElevationGainConsistent,
                ', isRouteTypeConsistent:', isRouteTypeConsistent);
            controls.updateDataConsistency(isDataConsistent);

            routeSuccessfullyVerified = isSinglePath && isPathLengthValid
                && areAllStationsPresent && isStationOrderCorrect
                && areStationsOnThePath && isPathElevationGainValid
                && isPathElevationLossValid && isPathElevationTotalChangeValid
                && isDataConsistent;
        })
        .catch(error => {
            logBuffer.add(lang.trans(error));
        })
        .finally(() => {
            controls.removeLoaderFromButton();

            if (routeSuccessfullyVerified) {
                logger.info('Route verification success. Approving...');
                helpers.approveRoute(context.routeApproveUrl)
                    .then(() => {
                        logger.info('Route approved.');
                        controls.showVerificationSuccessModal(5000);
                    })
                    .catch(error => {
                        logger.error('Route approval error.', error);
                    });
            } else {
                logger.info('Route verification failed. Cannot be approved.');
                controls.showVerificationFailedModal(logBuffer.getLogs());
            }
        });
}

if (process.env.NODE_ENV === 'production') {
    logger.setLevel('warn');
} else {
    logger.setLevel('debug');
}
window.setLogLevel = (logLevel = 'debug') => logger.setLevel(logLevel);

$('button#verifyRoute').bind('click', verifyRoute);
