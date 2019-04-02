import logger from './utils/loglevel';
import helpers from './utils/helpers';
import Route from './Route';
import Context from './Context';
import Controls from './Controls';
import Lang from './lang/Lang';

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
    const L = new Lang(context.language);

    controls.resetAll();
    logger.cleanBufferedLogs();
    controls.addLoaderToButton();

    helpers.getRoute(context.routeUrl)
        .done(data => {
            const geoJson = helpers.getGeoJSON(data);
            const route = new Route(geoJson);

            if (!route.isVerifiable()) {
                logger.error('Route is unverifiable.');
                controls.resetAll(false);
                return;
            }

            // Path basic checks
            const isSinglePath = route.isSinglePath();
            controls.updateSinglePath(isSinglePath);

            const routeLength = route.getPathLength();

            const isPathLengthValid = true;
            controls.updatePathLength(isPathLengthValid, routeLength);

            // Station checks
            const areAllStationsPresent = route.areAllStationsPresent();
            controls.updateNumberOfStations(areAllStationsPresent);
            const isStationOrderCorrect = route.isStationOrderCorrect();
            controls.updateStationsOrder(isStationOrderCorrect);
            const areStationsOnThePath = route.areStationsOnThePath();
            controls.updateStationsOnPath(areStationsOnThePath);

            // Elevation checks
            route.fetchPathElevationData()
                .then(() => {
                    const pathElevation = route.getPathElevation();
                    pathElevation.enrichData(routeLength);

                    const isPathElevationGainValid = true;
                    controls.updateElevationGain(isPathElevationGainValid, pathElevation.gain);

                    const isNormalRoute = routeLength >= NORMAL_ROUTE_MIN_LENGTH
                        || pathElevation.gain > SHORT_NORMAL_ROUTE_MIN_ELEVATION_GAIN
                        && routeLength >= SHORT_NORMAL_ROUTE_MIN_LENGTH;
                    controls.updateRouteType(isNormalRoute);

                    const isPathElevationLossValid = true;
                    controls.updateElevationLoss(isPathElevationLossValid, pathElevation.loss);

                    const isPathElevationTotalChangeValid = true;
                    controls.updateElevationTotalChange(isPathElevationTotalChangeValid,
                        pathElevation.totalChange);

                    controls.drawElevationChart(pathElevation);

                    helpers.getRouteParameters(context.routeParamsUrl)
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
                            const isDataConsistent = isLengthConsistent && isElevationGainConsistent && isRouteTypeConsistent;

                            logger.debug('isLengthConsistent:', isLengthConsistent,
                                ', isElevationGainConsistent:', isElevationGainConsistent,
                                ', isRouteTypeConsistent:', isRouteTypeConsistent);
                            controls.updateDataConsistency(isDataConsistent);

                            const canRouteBeAutomaticallyApproved = isSinglePath && isPathLengthValid
                                && areAllStationsPresent && isStationOrderCorrect
                                && areStationsOnThePath && isPathElevationGainValid
                                && isPathElevationLossValid && isPathElevationTotalChangeValid
                                && isDataConsistent;

                            if (canRouteBeAutomaticallyApproved) {
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
                                controls.showVerificationFailedModal(logger.getBufferedLogs());
                            }
                        })
                        .catch(error => {
                            logger.error('Route parameters data fetching error.', error);
                        });
                })
                .catch(error => {
                    logger.error('Path elevation data fetching error.', error);
                    controls.updateElevationGain(false, 0);
                    controls.updateElevationLoss(false, 0);
                    controls.updateElevationTotalChange(false, 0);
                    controls.updateDataConsistency(false);
                });
        }).fail((xhr, status) => {
            logger.error('Route fetching error. Status:', status);
        }).always(() => {
            controls.removeLoaderFromButton();
        });
}

if (process.env.NODE_ENV === 'production') {
    logger.setLevel('warn');
} else {
    logger.setLevel('debug');
}
window.setLogLevel = (logLevel = 'debug') => logger.setLevel(logLevel);

$('button#verifyRoute').bind('click', verifyRoute);
