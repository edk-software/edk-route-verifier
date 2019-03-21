import logger from 'loglevel';
import length from '@turf/length';
import lineSliceAlong from '@turf/line-slice-along';
import nearestPointOnLine from '@turf/nearest-point-on-line';
import pointToLineDistance from '@turf/point-to-line-distance';
import distance from '@turf/distance';
import { point } from '@turf/helpers';

import * as _ from './lodash';
import helpers from './helpers';


const turf = {
    distance,
    length,
    lineSliceAlong,
    point,
    pointToLineDistance,
    nearestPointOnLine
};


const CONSTS = {
    START_INDEX: 0,
    FIRST_STATION_INDEX: 1,
    LAST_STATION_INDEX: 14,
    END_INDEX: 15,
};


export default class Stations {
    constructor(points, lineString) {
        this.points = points;
        this.path = lineString;
        this.pathReversed = false;
        this.pathCircular = false;

        // Map points to stations and sort
        this._addIndexes();
        this._sortByIndex();

        // Path circular check
        this.pathStart = turf.point(this.path.geometry.coordinates[0]);
        this.pathEnd = turf.point(this.path.geometry.coordinates[this.path.geometry.coordinates.length - 1]);
        this._updateCircularity();

        // Path reverse check
        this._updateDirection();

        // Stations to path mapping
        this._findNearestPointsOnPath();
        this._sortByLocationOnPath();
    }

    _findNearestPointsOnPath() {
        let startPointDistance = 0;
        let nearestPointOnSlicedPath = null;
        const stepDistance = turf.length(this.path, {units: 'meters'}) / 10;
        const sampleDistance = stepDistance / 10;

        _.forEach(this.points, (point) => {
            // Filter out point if it is too far from path
            const distanceToPath = turf.pointToLineDistance(point.geometry.coordinates, this.path, {units: 'meters'});
            const maximumDistanceFromPath = 200; // meters
            if (distanceToPath > maximumDistanceFromPath) {
                logger.debug(`Point ${point.properties.name} too far from the path. Not looking for nearest point on line for it.`);
                point.properties.nearestOnLine = turf.nearestPointOnLine(this.path, point, {units: 'meters'});
                return true;
            }

            // Find nearest point on line for the specific station
            logger.debug(`Looking for nearest point on line for ${point.properties.name}`);

            // Set start point of the sliced path traversal
            startPointDistance = _.get(nearestPointOnSlicedPath, 'properties.location', 0);
            // Reset nearest point on sliced path
            nearestPointOnSlicedPath = null;
            for (let oldDistanceToPath = 0,
                     newDistanceToPath = Number.MAX_VALUE,
                     stopPointDistance = startPointDistance + stepDistance;
                 newDistanceToPath !== oldDistanceToPath || newDistanceToPath > maximumDistanceFromPath;
                 stopPointDistance += sampleDistance)
            {
                const slicedPath = turf.lineSliceAlong(this.path, startPointDistance, stopPointDistance, {units: 'meters'});
                nearestPointOnSlicedPath = turf.nearestPointOnLine(slicedPath, point, {units: 'meters'});
                oldDistanceToPath = newDistanceToPath;
                newDistanceToPath = turf.pointToLineDistance(point.geometry.coordinates, slicedPath, {units: 'meters'});
            }

            // Save nearest point on line for the specific station
            point.properties.nearestOnLine = nearestPointOnSlicedPath;

            // Update location on line (starting from the path beginning)
            point.properties.nearestOnLine.properties.location += startPointDistance;

            logger.debug(`Distance from path: ${point.properties.nearestOnLine.properties.dist.toFixed(2)} meter(s).`);
            logger.debug(`Location on path: ${point.properties.nearestOnLine.properties.location.toFixed(2)} meter(s).`);

            // Add debug information to map
            if (logger.getLevel() <= logger.levels.DEBUG && !!window.map) {
                // Show nearest point on line on map
                new google.maps.Marker({
                    position: helpers.getGoogleMapsLatLng(nearestPointOnSlicedPath.geometry.coordinates),
                    map: map,
                    label: {
                        fontWeight: 'bold',
                        text: `${point.properties.index}`,
                    },
                    title: `${point.properties.index}`,
                    icon: 'https://maps.google.com/mapfiles/ms/icons/yellow.png'
                });
                new google.maps.Marker({
                    position: helpers.getGoogleMapsLatLng(point.geometry.coordinates),
                    map: map,
                    label: {
                        fontWeight: 'bold',
                        text: `${point.properties.index}`,
                    },
                    title: `${point.properties.index}`,
                    icon: 'https://maps.google.com/mapfiles/ms/icons/blue.png'
                });
            }
        })
    }

    _sortByIndex() {
        this.points = _.sortBy(this.points, point => _.get(point, 'properties.index', Number.MAX_VALUE));
    }

    _sortByLocationOnPath() {
        this.points = _.sortBy(this.points, point => _.get(point, 'properties.nearestOnLine.properties.location', Number.MAX_VALUE));
    }

    _addIndexes() {
        const getIndex = str => {
            /** Regular expressions for extracting station number
             *  from a given string (which might be represented by different types
             *  of numbers and different delimiters)
             */
            const START_NAMES_REGEX = /^(wstęp|wprowadzenie|początek|start)$/ig;
            const END_NAMES_REGEX = /^(zakończenie|koniec|podsumowanie)$/ig;
            const ROMAN_NUMBERS_REGEX = /^(I|II|III|IV|V|VI|VII|VIII|IX|X|XI|XII|XIII|XIV)$/g;
            const EUROPEAN_NUMBERS_REGEX = /^\d+$/g;
            const SPLITTER_REGEX = /[ ,\._\-:;]+/;
            const ROMAN_EUROPEAN_MAP = {
                I: 1,
                II: 2,
                III: 3,
                IV: 4,
                V: 5,
                VI: 6,
                VII: 7,
                VIII: 8,
                IX: 9,
                X: 10,
                XI: 11,
                XII: 12,
                XIII: 13,
                XIV: 14,
            };

            let index = null;

            logger.debug(`Checking station index for string: ${str}`);

            // noname station
            if (!str) {
                return index;
            }

            // split
            const parts = str.trim().split(SPLITTER_REGEX);

            _.forEach(parts, part => {
                // try roman numbers
                // it isn't clear why there are for matches declaration
                let matches = part.match(ROMAN_NUMBERS_REGEX);
                if (!_.isNull(matches)) {
                    index = ROMAN_EUROPEAN_MAP[matches[0]];
                    return false;
                }

                // try european numbers
                matches = part.match(EUROPEAN_NUMBERS_REGEX);
                if (!_.isNull(matches)) {
                    const stationNumber = parseInt(matches[0]);
                    if (stationNumber >= CONSTS.FIRST_STATION_INDEX
                        && stationNumber <= CONSTS.LAST_STATION_INDEX) {
                        index = stationNumber;
                        return false;
                    }
                    return true;
                }

                // try start names
                matches = part.match(START_NAMES_REGEX);
                if (!_.isNull(matches)) {
                    index = CONSTS.START_INDEX;
                    return false;
                }

                // try end names
                matches = part.match(END_NAMES_REGEX);
                if (!_.isNull(matches)) {
                    index = CONSTS.END_INDEX;
                    return false;
                }
            });

            return index;
        };

        this.points = _.map(this.points, point => {
            const name = point.properties.name;

            point.properties.index = getIndex(name);
            return point;
        });
    }

    _updateDirection() {
        const startPoint = _.filter(this.points,
            point => point.properties.index === CONSTS.START_INDEX || point.properties.index === CONSTS.FIRST_STATION_INDEX);
        const endPoint = _.filter(this.points,
            point => point.properties.index === CONSTS.END_INDEX || point.properties.index === CONSTS.LAST_STATION_INDEX);
        const options = { units: 'meters' };

        if (!_.isEmpty(startPoint)) {
            logger.debug('Start point detected. Checking if it is closer to path start or path end...');
            const startPointToPathStartDistance = turf.distance(this.pathStart,
                startPoint[0], options);
            const startPointToPathEndDistance = turf.distance(this.pathEnd, startPoint[0], options);
            if (startPointToPathStartDistance > startPointToPathEndDistance) {
                logger.debug('Reversed path detected. Start point is closer to path end.');
                this.pathReversed = true;
            }
        } else if (!_.isEmpty(endPoint)) {
            logger.debug('End point detected. Checking if it is closer to path start or path end...');
            const endPointToPathStartDistance = turf.distance(this.pathStart, endPoint[0], options);
            const endPointToPathEndDistance = turf.distance(this.pathEnd, endPoint[0], options);
            if (endPointToPathEndDistance > endPointToPathStartDistance) {
                logger.debug('Reversed path detected. Start point is closer to path end.');
                this.pathReversed = true;
            }
        }

        if (this.pathReversed) {
            logger.debug('Reversing points.');
            this.path = helpers.reverseLineString(this.path);
        }
    }

    _updateCircularity() {
        const MAXIMUM_DISTANCE_START_END_IN_CIRCULAR_PATH = 1000; // meters
        const options = { units: 'meters' };

        let distance = turf.distance(this.pathStart, this.pathEnd, options);

        logger.debug('Distance between path start and end points:', distance.toFixed(2), 'meters.');
        if (distance <= MAXIMUM_DISTANCE_START_END_IN_CIRCULAR_PATH) {
            logger.debug('Circular path detected.');
            this.pathCircular = true;
        } else {
            logger.debug('Circular path not detected.');
            this.pathCircular = false;
        }
    }

    getCount() {
        let numberOfStations = 0;
        for (let stationNumber = CONSTS.FIRST_STATION_INDEX;
            stationNumber <= CONSTS.LAST_STATION_INDEX; stationNumber++) {
            let firstStationName = '';
            const stationsOfNumber = _.filter(this.points, station => {
                if (station.properties.index === stationNumber) {
                    firstStationName = station.properties.name;
                    return true;
                }
                return false;
            });
            if (stationsOfNumber.length !== 1) {
                logger.warn(`Station ${stationNumber} found ${stationsOfNumber.length} times.`);
            } else {
                logger.debug(`Station ${stationNumber} found. Station name: ${firstStationName}`);
                numberOfStations++;
            }
        }
        return numberOfStations;
    }

    isOrderCorrect() {
        let result = true;
        for (let i = 1; i < this.points.length; i++) {
            const currentStationNumber = this.points[i].properties.index;
            const previousStationNumber = this.points[i - 1].properties.index;
            logger.debug(`Point ${i - 1}`);
            if (currentStationNumber === null) {
                logger.debug(`Not checking order for unrecognized point: ${this.points[i].properties.name}`);
            } else if (previousStationNumber === null) {
                logger.debug(`Not checking order for unrecognized point: ${this.points[i - 1].properties.name}`);
            } else if (this.pathCircular
                && (
                    (previousStationNumber === CONSTS.FIRST_STATION_INDEX
                    && currentStationNumber === CONSTS.LAST_STATION_INDEX)
                    || (currentStationNumber === CONSTS.FIRST_STATION_INDEX
                    && previousStationNumber === CONSTS.LAST_STATION_INDEX)
                )
            ) {
                logger.debug('Not checking order for station', CONSTS.FIRST_STATION_INDEX, 'and', CONSTS.LAST_STATION_INDEX, 'when route is circular.');
            } else if (currentStationNumber <= previousStationNumber) {
                logger.warn(`Detected invalid order of stations. Station ${currentStationNumber} is after station ${previousStationNumber}.`);
                result = false;
            } else {
                logger.debug(`Station ${currentStationNumber} is after station ${previousStationNumber}.`);
            }
        }
        return result;
    }

    areAllOnThePath(maximumDistanceFromPath) {
        let result = true;

        _.forEach(this.points, (station, index) => {
            const stationNumber = station.properties.index;

            logger.debug(`Point ${index}`);
            if (stationNumber === null) {
                logger.debug(`Not checking distance for: ${station.properties.name}`);
            } else {
                const distanceFromStationToPath = helpers.getDistanceToNearestPointOnLine(station);
                logger.debug(`Station ${stationNumber} distance from path: ${distanceFromStationToPath.toFixed(2)} meter(s).`);
                if (distanceFromStationToPath > maximumDistanceFromPath) {
                    logger.warn(`Station ${stationNumber} is too far from path. Expected maximum distance from path: ${maximumDistanceFromPath} meter(s).`);
                    result = false;
                } else {
                    logger.debug(`Station ${stationNumber} is on the path.`);
                }
            }
        });

        return result;
    }

    isPathReversed() {
        return this.pathReversed;
    }
}
