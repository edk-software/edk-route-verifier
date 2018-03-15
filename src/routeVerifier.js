import logger from 'loglevel';
import helpers from './helpers';
import Route from './Route';
import Context from './Context';
import Controls from './Controls';


// Constants
const NORMAL_ROUTE_MIN_LENGTH = 40; // kilometers
const SHORT_NORMAL_ROUTE_MIN_LENGTH = 30; // kilometers
const SHORT_NORMAL_ROUTE_MIN_ELEVATION_GAIN = 500; // meters


function verifyRoute() {
    const context = new Context();
    const controls = new Controls();

    controls.resetAll();
    controls.addLoaderToButton();

    helpers.getRoute(context.routeUrl)
        .done(data => {
            const geoJson = helpers.getGeoJSON(data);
            const route = new Route(geoJson);

            if (!route.isVerifiable()) {
                logger.error('Critical error. Route is unverifiable.');
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

                    const isNormalRoute = routeLength >= NORMAL_ROUTE_MIN_LENGTH ||
                        pathElevation.gain > SHORT_NORMAL_ROUTE_MIN_ELEVATION_GAIN && routeLength >= SHORT_NORMAL_ROUTE_MIN_LENGTH;
                    controls.updateRouteType(isNormalRoute);

                    const isPathElevationLossValid = true;
                    controls.updateElevationLoss(isPathElevationLossValid, pathElevation.loss);

                    const isPathElevationTotalChangeValid = true;
                    controls.updateElevationTotalChange(isPathElevationTotalChangeValid, pathElevation.totalChange);

                    controls.drawElevationChart(pathElevation);

                    helpers.getRouteParameters(context.routeParamsUrl)
                        .then(parameters => {
                            const ACCEPTED_ROUTE_LENGTH_DIFF = 1; //km
                            const ACCEPTED_ELEVATION_GAIN_DIFF = 50; //m
                            const NORMAL_ROUTE_TYPE = 0;
                            const INSPIRED_ROUTE_TYPE = 1;
                            
                            const isLengthConsistent = (routeLength - ACCEPTED_ROUTE_LENGTH_DIFF <= parameters.length &&
                                                      parameters.length <= routeLength + ACCEPTED_ROUTE_LENGTH_DIFF);
                            const isElevationGainConsistent = (pathElevation.gain - ACCEPTED_ELEVATION_GAIN_DIFF <= parameters.ascent &&
                                                             parameters.ascent <= pathElevation.gain + ACCEPTED_ELEVATION_GAIN_DIFF);
                            const isRouteTypeConsistent = parameters.type === (isNormalRoute ? NORMAL_ROUTE_TYPE : INSPIRED_ROUTE_TYPE);
                            const isDataConsistent = isLengthConsistent && isElevationGainConsistent && isRouteTypeConsistent;
                            
                            logger.debug('isLengthConsistent:', isLengthConsistent,
                                         ', isElevationGainConsistent:', isElevationGainConsistent,
                                         ', isRouteTypeConsistent:', isRouteTypeConsistent); 
                            controls.updateDataConsistency(isDataConsistent);

                            const canRouteBeAutomaticallyApproved =
                                isPathLengthValid && isPathLengthValid && 
                                areAllStationsPresent && isStationOrderCorrect && areStationsOnThePath && 
                                isPathElevationGainValid && isPathElevationLossValid && isPathElevationTotalChangeValid &&
                                isDataConsistent;
                            
                            if (canRouteBeAutomaticallyApproved) {
                                logger.info('Route verification success. Approving...');
                                helpers.approveRoute(context.routeApproveUrl)
                                    .then(() => {
                                        logger.info('Route approved.');
                                        const reloadTimeout = setTimeout( () => {
                                            window.location.reload(1);
                                        }, 5000);
                                        $('div#pageReloadModal').on('hide.bs.modal', e => {
                                            clearTimeout(reloadTimeout);
                                        });
                                        $('div#pageReloadModal').modal();

                                    })
                                    .catch(error => {
                                        logger.error('Route approval error.', error);
                                    })
                            } else {
                                logger.info('Route verification failed. Cannot be approved.');
                            }
                        })
                        .catch(error => {
                            logger.error('Route parameters data fetching error.', error);
                        })
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

logger.setLevel('warn');
// Uncomment to set maximum loglevel
logger.enableAll();

$("button#verifyRoute").bind("click", verifyRoute);