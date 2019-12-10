import logger from 'loglevel';

import * as _ from './utils/lodash.js';

import helpers from './utils/helpers.js';
import {
    distance,
    length,
    lineSliceAlong,
    nearestPointOnLine,
    point,
    pointToLineDistance,
    options
} from './utils/turf.js';
import Lang from './lang/Lang.js';
import LogBuffer from './utils/LogBuffer.js';

const CONSTS = {
    START_INDEX: 0,
    FIRST_STATION_INDEX: 1,
    LAST_STATION_INDEX: 14,
    END_INDEX: 15
};

let lang = null;
let logBuffer = null;

export default class Stations {
    constructor(points, lineString) {
        this.points = points;
        this.path = lineString;
        this.pathReversed = false;
        this.pathCircular = false;

        // Map points to stations and sort
        this.addIndexes();
        this.sortByIndex();

        // Path circular check
        this.pathStart = point(this.path.geometry.coordinates[0]);
        this.pathEnd = point(this.path.geometry.coordinates[this.path.geometry.coordinates.length - 1]);
        this.updateCircularity();

        // Path reverse check
        this.updateDirection();

        // Stations to path mapping
        this.findNearestPointsOnPath();
        this.sortByLocationOnPath();

        lang = Lang.getInstance();
        logBuffer = LogBuffer.getInstance();
    }

    findNearestPointsOnPath() {
        const stepDistance = length(this.path, options) / 10;
        const sampleDistance = stepDistance / 10;

        let nearestPointOnSlicedPath = null;
        const updatedPoints = [];

        _.forEach(this.points, p => {
            const updatedPoint = p;
            // Filter out point if it is too far from path
            const { coordinates } = p.geometry;
            const distanceToPath = pointToLineDistance(coordinates, this.path, options);
            const maximumDistanceFromPath = 200; // meters
            if (distanceToPath > maximumDistanceFromPath) {
                logger.debug(
                    `Point ${p.properties.name} too far from the path. ` +
                        'Not looking for nearest point on line for it.'
                );

                updatedPoint.properties.nearestOnLine = nearestPointOnLine(this.path, p, options);
                updatedPoints.push(updatedPoint);

                return true;
            }

            // Find nearest point on line for the specific station
            logger.debug(`Looking for nearest point on line for ${p.properties.name}`);

            // Set start and stop point of the sliced path traversal
            const startPointDistance = _.get(nearestPointOnSlicedPath, 'properties.location', 0);
            let stopPointDistance = startPointDistance + stepDistance;

            // Reset nearest point on sliced path
            nearestPointOnSlicedPath = null;

            for (
                let oldDistanceToPath = 0, newDistanceToPath = Number.MAX_VALUE;
                newDistanceToPath !== oldDistanceToPath || newDistanceToPath > maximumDistanceFromPath;
                stopPointDistance += sampleDistance
            ) {
                const slicedPath = lineSliceAlong(this.path, startPointDistance, stopPointDistance, options);
                nearestPointOnSlicedPath = nearestPointOnLine(slicedPath, p, options);
                oldDistanceToPath = newDistanceToPath;
                newDistanceToPath = pointToLineDistance(coordinates, slicedPath, options);
            }

            // Save nearest point on line for the specific station
            updatedPoint.properties.nearestOnLine = nearestPointOnSlicedPath;

            // Update location on line (starting from the path beginning)
            updatedPoint.properties.nearestOnLine.properties.location += startPointDistance;

            const { dist } = updatedPoint.properties.nearestOnLine.properties;
            const { location } = updatedPoint.properties.nearestOnLine.properties;
            logger.debug(`Distance from path: ${dist.toFixed(2)} meter(s).`);
            logger.debug(`Location on path: ${location.toFixed(2)} meter(s).`);

            updatedPoints.push(updatedPoint);
            return true;
        });

        this.points = updatedPoints;
    }

    sortByIndex() {
        const getIndex = p => _.get(p, 'properties.index', Number.MAX_VALUE);
        this.points = _.sortBy(this.points, p => getIndex(p));
    }

    sortByLocationOnPath() {
        const getLocation = p => _.get(p, 'properties.nearestOnLine.properties.location', Number.MAX_VALUE);
        this.points = _.sortBy(this.points, p => getLocation(p));
    }

    addIndexes() {
        const getIndex = str => {
            /** Regular expressions for extracting station number
             *  from a given string (which might be represented by different types
             *  of numbers and different delimiters)
             */
            const START_NAMES_REGEX = /^(wstęp|wprowadzenie|początek|start)$/gi;
            const END_NAMES_REGEX = /^(zakończenie|koniec|podsumowanie)$/gi;
            const ROMAN_NUMBERS_REGEX = /^(I|II|III|IV|V|VI|VII|VIII|IX|X|XI|XII|XIII|XIV)$/g;
            const EUROPEAN_NUMBERS_REGEX = /^\d+$/g;
            const SPLITTER_REGEX = /[ ,._\-:;]+/;
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
                XIV: 14
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
                    const stationNumber = parseInt(matches[0], 10);
                    if (stationNumber >= CONSTS.FIRST_STATION_INDEX && stationNumber <= CONSTS.LAST_STATION_INDEX) {
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

                return true;
            });

            return index;
        };

        this.points = _.map(this.points, p => {
            const { name } = p.properties;
            const updatedPoint = p;

            updatedPoint.properties.index = getIndex(name);
            return updatedPoint;
        });
    }

    updateDirection() {
        const isIndexEqual = (p, index) => p.properties.index === index;
        const startPoint = _.filter(
            this.points,
            p => isIndexEqual(p, CONSTS.START_INDEX) || isIndexEqual(p, CONSTS.FIRST_STATION_INDEX)
        );
        const endPoint = _.filter(
            this.points,
            p => isIndexEqual(p, CONSTS.END_INDEX) || isIndexEqual(p, CONSTS.LAST_STATION_INDEX)
        );

        if (!_.isEmpty(startPoint)) {
            logger.debug('Start point detected. Checking if it is closer to path start or path end...');
            const startPointToPathStartDistance = distance(this.pathStart, startPoint[0], options);
            const startPointToPathEndDistance = distance(this.pathEnd, startPoint[0], options);
            if (startPointToPathStartDistance > startPointToPathEndDistance) {
                logger.debug('Reversed path detected. Start point is closer to path end.');
                this.pathReversed = true;
            }
        } else if (!_.isEmpty(endPoint)) {
            logger.debug('End point detected. Checking if it is closer to path start or path end...');
            const endPointToPathStartDistance = distance(this.pathStart, endPoint[0], options);
            const endPointToPathEndDistance = distance(this.pathEnd, endPoint[0], options);
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

    updateCircularity() {
        const maxDistanceBetweenPathEnds = 1000; // meters
        const distanceBetweenPathEnds = distance(this.pathStart, this.pathEnd, options);

        logger.debug('Distance between path start and end points:', distanceBetweenPathEnds.toFixed(2), 'meters.');
        if (distanceBetweenPathEnds <= maxDistanceBetweenPathEnds) {
            logger.debug('Circular path detected.');
            this.pathCircular = true;
        } else {
            logger.debug('Circular path not detected.');
            this.pathCircular = false;
        }
    }

    getCount() {
        let numberOfStations = 0;

        for (
            let stationNumber = CONSTS.FIRST_STATION_INDEX;
            stationNumber <= CONSTS.LAST_STATION_INDEX;
            stationNumber += 1
        ) {
            let firstStationName = '';
            const stationsOfNumber = _.filter(this.points, station => {
                if (station.properties.index === stationNumber) {
                    firstStationName = station.properties.name;
                    return true;
                }
                return false;
            });
            if (stationsOfNumber.length > 1) {
                logBuffer.add(
                    lang.trans('Station found multiple times', {
                        number: stationNumber,
                        times: stationsOfNumber.length
                    })
                );
            } else if (stationsOfNumber.length === 0) {
                logBuffer.add(lang.trans('Station not found', { number: stationNumber }));
            } else {
                logger.debug(`Station ${stationNumber} found. Station name: ${firstStationName}`);
                numberOfStations += 1;
            }
        }
        return numberOfStations;
    }

    isOrderCorrect() {
        let result = true;

        for (let i = 1; i < this.points.length; i += 1) {
            const currentStationNumber = this.points[i].properties.index;
            const previousStationNumber = this.points[i - 1].properties.index;
            logger.debug(`Point ${i - 1}`);
            if (currentStationNumber === null) {
                logger.debug(`Not checking order for unrecognized point: ${this.points[i].properties.name}`);
            } else if (previousStationNumber === null) {
                logger.debug(`Not checking order for unrecognized point: ${this.points[i - 1].properties.name}`);
            } else if (
                this.pathCircular &&
                ((previousStationNumber === CONSTS.FIRST_STATION_INDEX &&
                    currentStationNumber === CONSTS.LAST_STATION_INDEX) ||
                    (currentStationNumber === CONSTS.FIRST_STATION_INDEX &&
                        previousStationNumber === CONSTS.LAST_STATION_INDEX))
            ) {
                logger.debug(
                    'Not checking order for station',
                    CONSTS.FIRST_STATION_INDEX,
                    'and',
                    CONSTS.LAST_STATION_INDEX,
                    'when route is circular.'
                );
            } else if (currentStationNumber <= previousStationNumber) {
                logBuffer.add(lang.trans('Invalid stations order', { currentStationNumber, previousStationNumber }));
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
                logger.debug(
                    `Station ${stationNumber} distance from path: ` +
                        `${distanceFromStationToPath.toFixed(2)} meter(s).`
                );
                if (distanceFromStationToPath > maximumDistanceFromPath) {
                    logBuffer.add(
                        lang.trans('Station too far from path', {
                            number: stationNumber,
                            maximumDistance: maximumDistanceFromPath
                        })
                    );
                    result = false;
                } else {
                    logger.debug(`Station ${stationNumber} is on the path.`);
                }
            }
        });

        return result;
    }

    getUpdatedPath() {
        const lastStationPoint = _.find(this.points, p => p.properties.index === CONSTS.LAST_STATION_INDEX);

        if (lastStationPoint !== null) {
            const lastStationLocation = helpers.getLocationOfNearestPointOnLine(lastStationPoint);
            if (lastStationLocation > 0) {
                logger.debug(
                    'getPathEndingOnLastStation: Returning sliced path. ' +
                        `Last station location: ${lastStationLocation.toFixed(2)}`
                );
                return lineSliceAlong(this.path, 0, lastStationLocation, options);
            }
        }

        logger.debug('getPathEndingOnLastStation: Returning original path. Last station not found.');
        return this.path;
    }

    getStations() {
        const stations = [];
        _.forEach(this.points, station => {
            const { index, nearestOnLine } = station.properties;

            if (index >= CONSTS.FIRST_STATION_INDEX && index <= CONSTS.LAST_STATION_INDEX) {
                const { coordinates } = station.geometry;
                const latitude = coordinates[1];
                const longitude = coordinates[0];

                let stationObject = {
                    index,
                    latitude,
                    longitude
                };

                if (logger.getLevel() <= logger.levels.DEBUG) {
                    const { coordinates: neareastPointCoordinates } = nearestOnLine.geometry;
                    const neareastPointLatitude = neareastPointCoordinates[1];
                    const neareastPointLongitude = neareastPointCoordinates[0];

                    stationObject = {
                        ...stationObject,
                        nearestPoint: {
                            latitude: neareastPointLatitude,
                            longitude: neareastPointLongitude
                        }
                    };
                }

                stations.push(stationObject);
            }
        });

        return _.sortBy(stations, 'index');
    }
}
