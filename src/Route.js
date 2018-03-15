import logger from 'loglevel';
import * as _ from './lodash';
import helpers from './helpers';
import PathElevation from './PathElevation';
import Stations from './Stations';

// Constants
const EXPECTED_NUMBER_OF_PATHS = 1;
const EXPECTED_NUMBER_OF_STATIONS = 14;
const MAXIMUM_DISTANCE_FROM_STATION_TO_PATH = 100; // meters


export default class Route {

    constructor (geoJson) {
        this.geoJson = geoJson;
        this.lineString = helpers.getLineString(this.geoJson);
        this.points = helpers.getPoints(this.geoJson);
        this.isRouteVerifiable = true;


        if(_.isEmpty(this.lineString)) {
            logger.error('No line string in route.');
            this.isRouteVerifiable = false;
            logger.error('No points in route.');
            this.isRouteVerifiable = false;
        }

        if(this.isRouteVerifiable) {
            this.stations = new Stations(this.points, this.lineString);
            this.path = this.stations.isPathReversed() ? helpers.reverseLineString(this.lineString) : this.lineString;
            this.numberOfPaths = helpers.getNumberOfFeatures('LineString', this.geoJson);
        }
    }


    isVerifiable () {
        return this.isRouteVerifiable;
    }

    isSinglePath () {
        const result = _.isEqual(this.numberOfPaths, EXPECTED_NUMBER_OF_PATHS);
        logger.debug('isSinglePath:', result, ', numberOfPaths:', this.numberOfPaths);
        return result;
    }

    areAllStationsPresent () {
        const numberOfStations = this.stations.getCount();
        const result = _.isEqual(numberOfStations, EXPECTED_NUMBER_OF_STATIONS);
        logger.debug('areAllStationsPresent:', result,', numberOfStations:', numberOfStations);
        return result;
    }

    areStationsOnThePath () {
        const result = this.stations.areAllOnThePath(MAXIMUM_DISTANCE_FROM_STATION_TO_PATH);
        logger.debug('areStationsOnThePath:', result);
        return result;
    }

    isStationOrderCorrect () {
        const result = this.stations.isOrderCorrect();
        logger.debug('isStationOrderCorrect:', result);
        return result;
    }

    getPathLength () {
        let result = 0;

        const googleMapsPath = helpers.getGoogleMapsPath(this.path);
        result = google.maps.geometry.spherical.computeLength(googleMapsPath);
        result = result / 1000;

        logger.debug('getPathLength [km]:', result);
        return result;
    }

    fetchPathElevationData () {
        return helpers.getPathElevations(this.path)
            .then(elevations => {
                logger.debug('Path elevations:', elevations);
                this.pathElevation = new PathElevation(elevations);
                return this.pathElevation;
            })
            .catch(error => {
                throw new Error(error);
            });
    }


    getPathElevation () {
        logger.debug('getPathElevation:', this.pathElevation);
        return this.pathElevation;
    }
}


