import logger from 'loglevel';

import Configuration from './Configuration.js';
import LogBuffer from './utils/LogBuffer.js';
import Lang from './lang/Lang.js';
import helpers from './utils/helpers.js';
import Route from './Route.js';

import RouteVerificationOptions from '../data/RouteVerificationOptions.js';
import RouteVerificationInput from '../data/RouteVerificationInput.js';
import RouteVerificationOutput from '../data/RouteVerificationOutput.js';

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
    const geoJson = helpers.getGeoJSON(routeData.kml);
    const route = new Route(geoJson);

    if (!route.isVerifiable()) {
        return Promise.reject('Route is unverifiable');
    }

    // Path basic checks
    verificationOutput.setSinglePath(route.isSinglePath());
    verificationOutput.setPathLength(true, route.getLength());

    // Station checks
    verificationOutput.setNumberOfStations(route.areAllStationsPresent());
    verificationOutput.setStationsOrder(route.isStationOrderCorrect());
    verificationOutput.setStationsOnPath(route.areStationsOnThePath());

    return route
        .fetchPathElevationData()
        .then(pathElevation => {
            // Elevations calculation
            verificationOutput.setElevationCharacteristics(pathElevation.getData());
            verificationOutput.setElevationGain(true, pathElevation.gain);
            verificationOutput.setElevationLoss(true, pathElevation.loss);
            verificationOutput.setElevationTotalChange(true, pathElevation.totalChange);

            // Route Type calculation
            verificationOutput.setRouteType(route.isTypeValid());

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
