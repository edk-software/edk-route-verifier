import logger from 'loglevel';

import { length } from './utils/turf.js';
import * as _ from './utils/lodash.js';
import helpers from './utils/helpers.js';
import { ROUTE_TYPE } from './Consts.js';
import PathElevation from './PathElevation.js';
import Stations from './Stations.js';
import Lang from './lang/Lang.js';
import LogBuffer from './utils/LogBuffer.js';
import GoogleMapsApiError from './errors/GoogleMapsApiError.js';
import NoPathInRouteError from './errors/NoPathInRouteError.js';

// Constants
const EXPECTED_NUMBER_OF_PATHS = 1;
const EXPECTED_NUMBER_OF_STATIONS = 14;

const NORMAL_ROUTE_MIN_LENGTH = 30; // kilometers
const MAX_ROUTE_LENGTH_FOR_SHORT_ROUTES = 40; // kilometers
const MIN_ELEVATION_GAIN_FOR_SHORT_ROUTES = 500; // meters

let lang = null;
let logBuffer = null;

export default class Route {
    constructor(geoJson) {
        this.type = ROUTE_TYPE.UNKNOWN;
        this.numberOfPaths = 0;
        this.length = 0;
        this.geoJson = geoJson;
        this.lineString = helpers.getLineString(this.geoJson);
        this.points = helpers.getPoints(this.geoJson);
        this.pathElevation = null;

        lang = Lang.getInstance();
        logBuffer = LogBuffer.getInstance();

        this.hasPath = true;
        if (_.isEmpty(this.lineString)) {
            logBuffer.add(lang.trans('No path in route'));
            this.hasPath = false;
        }

        if (_.isEmpty(this.points)) {
            logBuffer.add(lang.trans('No points in route'));
        }

        if (this.hasPath) {
            this.stations = new Stations(this.points, this.lineString);
            this.path = this.stations.getPathEndingOnLastStation();
            this.numberOfPaths = helpers.getNumberOfFeatures('LineString', this.geoJson);
            this.length = length(this.path);

            if (this.length >= NORMAL_ROUTE_MIN_LENGTH) {
                this.type = ROUTE_TYPE.NORMAL;
            }
        }
    }

    isSinglePath() {
        const result = _.isEqual(this.numberOfPaths, EXPECTED_NUMBER_OF_PATHS);
        if (!result) {
            logBuffer.add(lang.trans('No single path defined'));
        }
        logger.debug('isSinglePath:', result, ', numberOfPaths:', this.numberOfPaths);
        return result;
    }

    areAllStationsPresent() {
        const numberOfStations = this.stations.getCount();
        const result = _.isEqual(numberOfStations, EXPECTED_NUMBER_OF_STATIONS);
        logger.debug('areAllStationsPresent:', result, ', numberOfStations:', numberOfStations);
        return result;
    }

    areStationsOnThePath() {
        const result = this.stations.areAllOnThePath();
        logger.debug('areStationsOnThePath:', result);
        return result;
    }

    isStationOrderCorrect() {
        const result = this.stations.isOrderCorrect();
        logger.debug('isStationOrderCorrect:', result);
        return result;
    }

    fetchData() {
        if (this.hasPath) {
            return helpers
                .getPathElevations(this.path)
                .then(elevations => {
                    logger.debug('Path elevations:', elevations);
                    this.pathElevation = new PathElevation(elevations, this.length);

                    return this.pathElevation;
                })
                .catch(error => {
                    logger.error('Path elevation data fetching error.');
                    logger.error(error);
                    const errorMessage = _.get(error, 'json.error_message', '');
                    const status = _.get(error, 'json.status', '');
                    return Promise.reject(
                        new GoogleMapsApiError('Path elevation data fetching error', status, errorMessage)
                    );
                });
        }

        return Promise.reject(new NoPathInRouteError());
    }

    getPathStart() {
        return this.stations.getPathStart();
    }

    getPathEnd() {
        return this.stations.getPathEnd();
    }

    getPathCoordinates() {
        return _.map(_.get(this.path, 'geometry.coordinates', []), coords =>
            helpers.createCoordinatesObject(coords[1], coords[0])
        );
    }

    getStations() {
        return this.stations.getStations();
    }

    getLength() {
        return this.length;
    }

    isLengthValid() {
        return this.length >= NORMAL_ROUTE_MIN_LENGTH;
    }

    getType() {
        return this.type;
    }

    isTypeValid() {
        const isValid = this.type === ROUTE_TYPE.NORMAL;
        if (!isValid) {
            logBuffer.add(lang.trans('Route does not meet minimum length requirements'));
        }
        logger.debug('isTypeValid:', isValid);
        return isValid;
    }

    isElevationGainValid() {
        let isValid = false;
        if (this.pathElevation && this.pathElevation.gain) {
            isValid =
                this.length >= NORMAL_ROUTE_MIN_LENGTH && this.length < MAX_ROUTE_LENGTH_FOR_SHORT_ROUTES
                    ? this.pathElevation.gain >= MIN_ELEVATION_GAIN_FOR_SHORT_ROUTES
                    : true;
            logger.debug('isElevationGainValid:', isValid);
        } else {
            logger.error('isElevationGainValid cannot be calculated properly without path elevations.');
        }
        if (!isValid) {
            logBuffer.add(lang.trans('Elevation gain does not meet minimum requirements'));
        }
        return isValid;
    }
}
