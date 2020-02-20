import logger from 'loglevel';

import * as _ from './utils/lodash.js';

import helpers from './utils/helpers.js';
import { distance, lineSliceAlong, nearestPointOnLine, point, options } from './utils/turf.js';
import Lang from './lang/Lang.js';
import LogBuffer from './utils/LogBuffer.js';

const CONSTS = {
    START_INDEX: 0,
    FIRST_STATION_INDEX: 1,
    LAST_STATION_INDEX: 14,
    END_INDEX: 15,
    MAXIMUM_DISTANCE_FROM_STATION_TO_PATH: 50 // meters
};

let lang = null;
let logBuffer = null;

const trim = str => String(str).trim();

const getPointCoordinates = geoJsonPoint => {
    const { coordinates } = geoJsonPoint.geometry;

    return {
        latitude: coordinates[1],
        longitude: coordinates[0]
    };
};

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
        if (!this.pathCircular) {
            this.updateDirection();
        }

        // Stations to path mapping
        this.updatePointsWithNearestOnLine();
        this.sortByLocationOnPath();

        lang = Lang.getInstance();
        logBuffer = LogBuffer.getInstance();
    }

    updatePointsWithNearestOnLine() {
        this.points = _.map(this.points, p => {
            const updatedPoint = p;
            const nearestPoint = nearestPointOnLine(this.path, p, options);
            updatedPoint.properties.nearestOnLine = nearestPoint;
            logger.debug(
                `Nearest point on line for ${trim(p.properties.name)} is at ${_.get(
                    nearestPoint,
                    'properties.location',
                    0
                ).toFixed(2)}m on the path.`
            );
            return updatedPoint;
        });
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
            const { coordinates } = this.path.geometry;
            this.pathStart = point(coordinates[0]);
            this.pathEnd = point(coordinates[coordinates.length - 1]);
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
                logger.debug(`Station ${stationNumber} found. Station name: ${trim(firstStationName)}`);
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
                logger.debug(`Not checking order for unrecognized point: ${trim(this.points[i].properties.name)}`);
            } else if (previousStationNumber === null) {
                logger.debug(`Not checking order for unrecognized point: ${trim(this.points[i - 1].properties.name)}`);
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

    areAllOnThePath() {
        let result = true;

        _.forEach(this.points, (station, index) => {
            const stationNumber = station.properties.index;

            logger.debug(`Point ${index}`);
            if (stationNumber === null) {
                logger.debug(`Not checking distance for: ${trim(station.properties.name)}`);
            } else {
                const distanceFromStationToPath = helpers.getDistanceToNearestPointOnLine(station);
                logger.debug(
                    `Station ${stationNumber} distance from path: ` +
                        `${distanceFromStationToPath.toFixed(2)} meter(s).`
                );
                if (distanceFromStationToPath > CONSTS.MAXIMUM_DISTANCE_FROM_STATION_TO_PATH) {
                    logBuffer.add(
                        lang.trans('Station too far from path', {
                            number: stationNumber,
                            maximumDistance: CONSTS.MAXIMUM_DISTANCE_FROM_STATION_TO_PATH
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

    getLastStationLocationOnPath() {
        const lastStationPoint = _.find(this.points, p => p.properties.index === CONSTS.LAST_STATION_INDEX);
        return helpers.getLocationOfNearestPointOnLine(lastStationPoint);
    }

    getPathEndingOnLastStation() {
        const lastStationLocation = this.getLastStationLocationOnPath();
        if (lastStationLocation > 0 && !this.pathCircular) {
            logger.debug(
                'getPathEndingOnLastStation: Returning sliced path. ' +
                    `Last station location: ${lastStationLocation.toFixed(2)}`
            );
            return lineSliceAlong(this.path, 0, lastStationLocation, options);
        }

        logger.debug('getPathEndingOnLastStation: Returning original path. Last station not found.');
        return this.path;
    }

    getPathStart() {
        return getPointCoordinates(this.pathStart);
    }

    getPathEnd() {
        return getPointCoordinates(this.pathEnd);
    }

    getStations() {
        const stations = [];
        _.forEach(this.points, station => {
            const { index, nearestOnLine } = station.properties;

            if (index >= CONSTS.FIRST_STATION_INDEX && index <= CONSTS.LAST_STATION_INDEX) {
                const stationCoordinates = getPointCoordinates(station);

                let stationObject = {
                    index,
                    ...stationCoordinates
                };

                if (logger.getLevel() <= logger.levels.DEBUG) {
                    const neareastPointCoordinates = getPointCoordinates(nearestOnLine);

                    stationObject = {
                        ...stationObject,
                        nearestPoint: neareastPointCoordinates
                    };
                }

                stations.push(stationObject);
            }
        });

        return _.sortBy(stations, 'index');
    }
}
