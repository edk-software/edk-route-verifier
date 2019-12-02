import logger from 'loglevel';
import turfLength from '@turf/length';

import * as _ from './utils/lodash.js';
import helpers from './utils/helpers.js';
import PathElevation from './PathElevation.js';
import Stations from './Stations.js';
import Lang from './lang/Lang.js';
import LogBuffer from './utils/LogBuffer.js';

// Constants
const EXPECTED_NUMBER_OF_PATHS = 1;
const EXPECTED_NUMBER_OF_STATIONS = 14;
const MAXIMUM_DISTANCE_FROM_STATION_TO_PATH = 50; // meters

const NORMAL_ROUTE_MIN_LENGTH = 40; // kilometers
const SHORT_NORMAL_ROUTE_MIN_LENGTH = 30; // kilometers
const SHORT_NORMAL_ROUTE_MIN_ELEVATION_GAIN = 500; // meters
const INSPIRED_ROUTE_MIN_LENGTH = 20; // kilometers

const ROUTE_TYPE = {
    NORMAL: 0,
    INSPIRED: 1,
    UNKNOWN: 2
};

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
        this.isRouteVerifiable = true;

        lang = Lang.getInstance();
        logBuffer = LogBuffer.getInstance();

        if (_.isEmpty(this.lineString)) {
            logBuffer.add(lang.trans('No path in route'));
            this.isRouteVerifiable = false;
        }
        if (_.isEmpty(this.points)) {
            logBuffer.add(lang.trans('No points in route'));
        }
        if (this.isRouteVerifiable) {
            this.stations = new Stations(this.points, this.lineString);
            this.path = this.stations.getUpdatedPath();
            this.numberOfPaths = helpers.getNumberOfFeatures('LineString', this.geoJson);
            this.length = turfLength.default(this.path);

            if (this.length >= NORMAL_ROUTE_MIN_LENGTH) {
                this.type = ROUTE_TYPE.NORMAL;
            }
        }
    }

    isVerifiable() {
        return this.isRouteVerifiable;
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
        const result = this.stations.areAllOnThePath(MAXIMUM_DISTANCE_FROM_STATION_TO_PATH);
        logger.debug('areStationsOnThePath:', result);
        return result;
    }

    isStationOrderCorrect() {
        const result = this.stations.isOrderCorrect();
        logger.debug('isStationOrderCorrect:', result);
        return result;
    }

    fetchData() {
        if (this.isVerifiable()) {
            return helpers
                .getPathElevations(this.path)
                .then(elevations => {
                    logger.debug('Path elevations:', elevations);
                    this.pathElevation = new PathElevation(elevations, this.length);
                    // Update route type
                    if (this.type !== ROUTE_TYPE.NORMAL) {
                        if (
                            this.pathElevation.gain > SHORT_NORMAL_ROUTE_MIN_ELEVATION_GAIN &&
                            this.length >= SHORT_NORMAL_ROUTE_MIN_LENGTH
                        ) {
                            this.type = ROUTE_TYPE.NORMAL;
                        } else if (this.length >= INSPIRED_ROUTE_MIN_LENGTH) {
                            this.type = ROUTE_TYPE.INSPIRED;
                        }
                    }
                    return this.pathElevation;
                })
                .catch(error => {
                    logger.error('Path elevation data fetching error');
                    logger.error(Object.keys(error));
                    logger.error(error.statusMessage);
                    logger.error(error.statusCode);
                    logger.error(error.status);
                    return Promise.reject('Path elevation data fetching error');
                });
        }

        return Promise.reject('Route is unverifiable');
    }

    getStations() {
        return this.stations.getStations();
    }

    getLength() {
        return this.length;
    }

    getType() {
        return this.type;
    }

    isTypeValid() {
        return this.type === ROUTE_TYPE.NORMAL || this.type === ROUTE_TYPE.INSPIRED;
    }
}
