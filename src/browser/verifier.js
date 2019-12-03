import logger from 'loglevel';
import fetch from 'node-fetch';

import Controls from './Controls';

// Google Maps API loading and key validation
window.GOOGLE_MAPS_API_LOADED = true;
window.gm_authFailure = () => {
    window.GOOGLE_MAPS_API_LOADED = false;
};

function runVerifier() {
    if (!window.GOOGLE_MAPS_API_LOADED || !window.google || !window.google.maps) {
        window.GOOGLE_MAPS_API_LOADED = false;
        logger.error('Google Maps API is not loaded. Verification cannot be done.');
    }

    const mapCanvasElement = $('div#map-canvas');
    const routeUrl = mapCanvasElement.attr('data-what');
    const language = $('html').attr('lang');

    const controls = new Controls();
    controls.resetAll();
    controls.addLoaderToButton();

    fetch(routeUrl)
        .then(res => res.text())
        .then(kml => {
            return fetch('/api/verify', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    kml,
                    language
                })
            });
        })
        .then(res => res.json()) // expecting a json response
        .then(json => {
            const {
                elevationGain,
                elevationLoss,
                elevationTotalChange,
                logs,
                numberOfStations,
                pathLength,
                routeType,
                singlePath,
                stationsOnPath,
                stationsOrder
            } = json.verificationStatus;
            controls.removeLoaderFromButton();
            controls.updateSinglePath(singlePath.valid);
            controls.updatePathLength(pathLength.valid, pathLength.value);
            controls.updateRouteType(routeType.valid, routeType.value);
            controls.updateNumberOfStations(numberOfStations.valid);
            controls.updateStationsOrder(stationsOrder.valid);
            controls.updateStationsOnPath(stationsOnPath.valid);
            controls.updateElevationGain(elevationGain.valid, elevationGain.value);
            controls.updateElevationLoss(elevationLoss.valid, elevationLoss.value);
            controls.updateElevationTotalChange(elevationTotalChange.valid, elevationTotalChange.value);
            controls.drawElevationChart(json.elevationCharacteristics);

            if (logs.length === 0) {
                controls.showVerificationSuccessModal();
            } else {
                controls.showVerificationFailedModal(logs);
            }
        })
        .catch(error => {
            controls.removeLoaderFromButton();
            logger.error(error);
        });
}

$('button#verifyRoute').bind('click', runVerifier);
