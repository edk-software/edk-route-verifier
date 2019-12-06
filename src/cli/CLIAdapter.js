import logger from 'loglevel';
import AbstractOutputAdapter from '../data/AbstractOutputAdapter.js';
import Lang from '../core/lang/Lang.js';
import GoogleMapsApiError from '../core/errors/GoogleMapsApiError.js';
import KMLError from '../core/errors/KMLError.js';
import NoPathInRouteError from '../core/errors/NoPathInRouteError.js';
import InvalidInputError from '../core/errors/InvalidInputError.js';

export default class CLIAdapter extends AbstractOutputAdapter {
    get() {
        const lang = Lang.getInstance();
        const output = this.verificationOutput;
        const getStatusString = status => lang.trans(status ? 'OK' : 'Failed');
        const getRouteTypeString = type => {
            let stringType = 'Unknown';
            if (type === 0) {
                stringType = 'Normal';
            } else if (type === 1) {
                stringType = 'Inspired';
            }
            return lang.trans(stringType);
        };

        logger.info(lang.trans('Route Characteristics'));
        logger.info(lang.trans('Path Length', { length: output.getPathLength() }));
        logger.info(lang.trans('Route Type', { type: getRouteTypeString(output.getRouteType()) }));
        logger.info(lang.trans('Elevation Gain', { gain: output.getElevationGain() }));
        logger.info(lang.trans('Elevation Loss', { loss: output.getElevationLoss() }));
        logger.info(lang.trans('Elevation Total Change', { change: output.getElevationTotalChange() }));

        logger.info(lang.trans('Verification Status', { status: getStatusString(output.getStatus()) }));
        logger.info(lang.trans('Single Path', { status: getStatusString(output.getSinglePathStatus()) }));
        logger.info(lang.trans('Route Type Status', { status: getStatusString(output.getRouteTypeStatus()) }));
        logger.info(lang.trans('Number Of Stations', { status: getStatusString(output.getNumberOfStationsStatus()) }));
        logger.info(lang.trans('Stations Order', { status: getStatusString(output.getStationsOrderStatus()) }));
        logger.info(lang.trans('Stations On Path', { status: getStatusString(output.getStationsOnPathStatus()) }));

        if (!output.getStatus()) {
            logger.info(lang.trans('Errors'));
            logger.info(output.getLogs().join('\n'));
        }
    }

    static handleError(error) {
        const lang = Lang.getInstance();

        logger.error(lang.trans('Route verification cannot be completed'));

        let message = 'Unexpected internal server error';
        if (error instanceof GoogleMapsApiError) {
            message = 'Error fetching data from Google Maps API';
        }
        if (error instanceof KMLError) {
            message = 'Provided KML string input is invalid';
        }
        if (error instanceof NoPathInRouteError) {
            message = 'No path is defined in provided KML string';
        }
        if (error instanceof InvalidInputError) {
            message = 'Provided verification inputs are invalid';
        }
        logger.error(lang.trans(message));
    }
}
