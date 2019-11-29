import length from '@turf/length';
import lineSliceAlong from '@turf/line-slice-along';
import nearestPointOnLine from '@turf/nearest-point-on-line';
import pointToLineDistance from '@turf/point-to-line-distance';
import distance from '@turf/distance';
import turfHelpers from '@turf/helpers/index.js';
import logger from 'loglevel';

import * as _ from './utils/lodash.js';
import helpers from './utils/helpers.js';
import Lang from './lang/Lang.js';
import LogBuffer from './utils/LogBuffer.js';

const turf = {
    distance: distance.default,
    length: length.default,
    lineSliceAlong: lineSliceAlong.default,
    point: turfHelpers.point,
    pointToLineDistance: pointToLineDistance.default,
    nearestPointOnLine: nearestPointOnLine.default,

    options: { units: 'meters' }
};

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
        this.pathStart = turf.point(this.path.geometry.coordinates[0]);
        this.pathEnd = turf.point(this.path.geometry.coordinates[this.path.geometry.coordinates.length - 1]);
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
        const stepDistance = turf.length(this.path, turf.options) / 10;
        const sampleDistance = stepDistance / 10;

        let nearestPointOnSlicedPath = null;
        _.forEach(this.points, point => {
            // Filter out point if it is too far from path
            const coordinates = point.geometry.coordinates;
            const distanceToPath = turf.pointToLineDistance(coordinates, this.path, turf.options);
            const maximumDistanceFromPath = 200; // meters
            if (distanceToPath > maximumDistanceFromPath) {
                logger.debug(
                    `Point ${point.properties.name} too far from the path. ` +
                        'Not looking for nearest point on line for it.'
                );
                point.properties.nearestOnLine = turf.nearestPointOnLine(this.path, point, turf.options);
                return true;
            }

            // Find nearest point on line for the specific station
            logger.debug(`Looking for nearest point on line for ${point.properties.name}`);

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
                const slicedPath = turf.lineSliceAlong(this.path, startPointDistance, stopPointDistance, turf.options);
                nearestPointOnSlicedPath = turf.nearestPointOnLine(slicedPath, point, turf.options);
                oldDistanceToPath = newDistanceToPath;
                newDistanceToPath = turf.pointToLineDistance(coordinates, slicedPath, turf.options);
            }

            // Save nearest point on line for the specific station
            point.properties.nearestOnLine = nearestPointOnSlicedPath;

            // Update location on line (starting from the path beginning)
            point.properties.nearestOnLine.properties.location += startPointDistance;

            const dist = point.properties.nearestOnLine.properties.dist;
            const location = point.properties.nearestOnLine.properties.location;
            logger.debug(`Distance from path: ${dist.toFixed(2)} meter(s).`);
            logger.debug(`Location on path: ${location.toFixed(2)} meter(s).`);

            // this.addDebugInformationToMap(point, nearestPointOnSlicedPath);
        });
    }

    // addDebugInformationToMap(originalPoint, nearestPoint) {
    //     if (logger.getLevel() <= logger.levels.DEBUG && !!window.map) {
    //         new google.maps.Marker({
    //             position: helpers.getGoogleMapsLatLng(nearestPoint.geometry.coordinates),
    //             map: window.map,
    //             label: {
    //                 fontWeight: 'bold',
    //                 text: `${originalPoint.properties.index}`,
    //             },
    //             title: `${originalPoint.properties.index}`,
    //             icon: 'https://maps.google.com/mapfiles/ms/icons/yellow.png',
    //         });
    //         new google.maps.Marker({
    //             position: helpers.getGoogleMapsLatLng(originalPoint.geometry.coordinates),
    //             map: window.map,
    //             label: {
    //                 fontWeight: 'bold',
    //                 text: `${originalPoint.properties.index}`,
    //             },
    //             title: `${originalPoint.properties.index}`,
    //             icon: 'https://maps.google.com/mapfiles/ms/icons/blue.png',
    //         });
    //     }
    // }

    sortByIndex() {
        const getIndex = point => _.get(point, 'properties.index', Number.MAX_VALUE);
        this.points = _.sortBy(this.points, point => getIndex(point));
    }

    sortByLocationOnPath() {
        const getLocation = point => _.get(point, 'properties.nearestOnLine.properties.location', Number.MAX_VALUE);
        this.points = _.sortBy(this.points, point => getLocation(point));
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
                    const stationNumber = parseInt(matches[0]);
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
            });

            return index;
        };

        this.points = _.map(this.points, point => {
            const name = point.properties.name;

            point.properties.index = getIndex(name);
            return point;
        });
    }

    updateDirection() {
        const isIndexEqual = (point, index) => point.properties.index === index;
        const startPoint = _.filter(
            this.points,
            point => isIndexEqual(point, CONSTS.START_INDEX) || isIndexEqual(point, CONSTS.FIRST_STATION_INDEX)
        );
        const endPoint = _.filter(
            this.points,
            point => isIndexEqual(point, CONSTS.END_INDEX) || isIndexEqual(point, CONSTS.LAST_STATION_INDEX)
        );

        if (!_.isEmpty(startPoint)) {
            logger.debug('Start point detected. Checking if it is closer to path start or path end...');
            const startPointToPathStartDistance = turf.distance(this.pathStart, startPoint[0], turf.options);
            const startPointToPathEndDistance = turf.distance(this.pathEnd, startPoint[0], turf.options);
            if (startPointToPathStartDistance > startPointToPathEndDistance) {
                logger.debug('Reversed path detected. Start point is closer to path end.');
                this.pathReversed = true;
            }
        } else if (!_.isEmpty(endPoint)) {
            logger.debug('End point detected. Checking if it is closer to path start or path end...');
            const endPointToPathStartDistance = turf.distance(this.pathStart, endPoint[0], turf.options);
            const endPointToPathEndDistance = turf.distance(this.pathEnd, endPoint[0], turf.options);
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
        const distance = turf.distance(this.pathStart, this.pathEnd, turf.options);

        logger.debug('Distance between path start and end points:', distance.toFixed(2), 'meters.');
        if (distance <= maxDistanceBetweenPathEnds) {
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
            stationNumber++
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
        const lastStationPoint = _.find(this.points, point => point.properties.index === CONSTS.LAST_STATION_INDEX);

        if (lastStationPoint !== null) {
            const lastStationLocation = helpers.getLocationOfNearestPointOnLine(lastStationPoint);
            if (lastStationLocation > 0) {
                logger.debug(
                    'getPathEndingOnLastStation: Returning sliced path. ' +
                        `Last station location: ${lastStationLocation.toFixed(2)}`
                );
                return turf.lineSliceAlong(this.path, 0, lastStationLocation, turf.options);
            }
        }

        logger.debug('getPathEndingOnLastStation: Returning original path. Last station not found.');
        return this.path;
    }
}
