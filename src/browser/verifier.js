// import logger from 'loglevel';
import fetch from 'node-fetch';

import Context from './Context';
import Controls from './Controls';

// Google Maps API loading and key validation
window.GOOGLE_MAPS_API_LOADED = true;
window.gm_authFailure = () => {
    window.GOOGLE_MAPS_API_LOADED = false;
};

function runVerifier() {
    if (!window.GOOGLE_MAPS_API_LOADED || !window.google || !window.google.maps) {
        window.GOOGLE_MAPS_API_LOADED = false;
        console.error('Google Maps API is not loaded. Verification cannot be done.');
    }

    const context = new Context();
    const { language, routeUrl } = context;

    const controls = new Controls();
    controls.resetAll();
    controls.addLoaderToButton();

    // const logBuffer = new LogBuffer();
    // logBuffer.cleanLogs();

    fetch(routeUrl)
        .then(kml =>
            fetch('/api/verify', {
                method: 'POST',
                body: {
                    kml,
                    language
                }
            })
        )
        .then(res => res.json()) // expecting a json response
        .then(json => console.log(json));
}

$('button#verifyRoute').bind('click', runVerifier);
