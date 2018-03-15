import logger from 'loglevel';
import * as _ from './lodash';
import pointOnLine from '@turf/point-on-line';
import distance from '@turf/distance';
import helpers from '@turf/helpers'
const turf = {
    pointOnLine,
    distance,
    helpers
};


const CONSTS = {
    START_INDEX: 0,
    FIRST_STATION_INDEX: 1,
    LAST_STATION_INDEX: 14,
    END_INDEX: 15
}


export default class Stations {

    constructor(points, lineString) {
        this.points = points;
        this.path = lineString;
        this.pathReversed = false;
        this.pathCircular = false;
        this.pathStart = turf.helpers.point(this.path.geometry.coordinates[0]);
        this.pathEnd = turf.helpers.point(this.path.geometry.coordinates[this.path.geometry.coordinates.length-1]);

        this._sortPoints();
        this._addIndexes();
        this._updateCircularity();
        if (!this.pathCircular) {
            this._updateDirection();
        }
    }


    _sortPoints () {
        const path = this.path;
        const enhancedPoints = _.map(this.points, point => {
            point.properties.nearestOnLine = turf.pointOnLine(path, point, 'meters');
            return point;
        });

        const sortedPoints = _.sortBy(enhancedPoints, point => {
            return point.properties.nearestOnLine.properties.location;
        })

        this.points = sortedPoints;
    }

    _addIndexes () {
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
                'I': 1, 'II': 2, 'III': 3, 'IV': 4, 'V': 5, 'VI': 6, 'VII': 7,
                'VIII': 8, 'IX': 9, 'X': 10, 'XI': 11, 'XII': 12, 'XIII': 13, 'XIV': 14
            };

            let index = null;

            logger.debug('Checking station index for string: ' + str);

            // noname station
            if (!str) {
                return index;
            }

            // split
            const parts = str.trim().split(SPLITTER_REGEX);

            _.forEach(parts, part => {
                // try roman numbers
                let matches = part.match(ROMAN_NUMBERS_REGEX); // it isn't clear why there are for matches declaration
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
                    } else {
                        return true;
                    }
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
        }

        this.points = _.map(this.points, function (point) {
            const name = point.properties.name;
            const number = getIndex(name);

            point.properties.index = number;
            return point;
        });
    }

    _updateDirection () {
        const pathReversed = false;

        const startPoint = _.filter(this.points, point => {
            return point.properties.index === CONSTS.START_INDEX;
        })
        const endPoint = _.filter(this.points, point => {
            return point.properties.index === CONSTS.END_INDEX;
        })
        const options = {units: 'kilometers'};

        if (!_.isEmpty(startPoint)) {
            logger.debug('Start point detected. Checking if it is closer to path start or path end...');
            const startPointToPathStartDistance = turf.distance(this.pathStart, startPoint[0], options);
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
            this.points = this.points.reverse();
        }
    }

    _updateCircularity () {
        const MAXIMUM_DISTANCE_START_END_IN_CIRCULAR_PATH = 500; // meters
        const options = {units: 'kilometers'};

        let distance = turf.distance(this.pathStart, this.pathEnd, options);
        distance = distance*1000;

        if (distance <= MAXIMUM_DISTANCE_START_END_IN_CIRCULAR_PATH) {
            logger.debug('Circular path detected. Distance between path start and end points:', distance.toFixed(2), 'meters.');
            this.pathCircular = true;
        }
    }

    getCount () {
        let numberOfStations = 0;
        for (let stationNumber = CONSTS.FIRST_STATION_INDEX; stationNumber <= CONSTS.LAST_STATION_INDEX; stationNumber++) {
            let firstStationName = '';
            let stationsOfNumber = _.filter(this.points, function (station) {
                if (station.properties.index === stationNumber) {
                    firstStationName = station.properties.name;
                    return true;
                } else {
                    return false;
                }
            });
            if (stationsOfNumber.length !== 1) {
                logger.warn('Station ' + stationNumber + ' found ' + stationsOfNumber.length + ' times.');
            } else {
                logger.debug('Station ' + stationNumber + ' found. Station name: ' + firstStationName);
                numberOfStations++;
            }
        }
        return numberOfStations;
    }

    isOrderCorrect () {
        let result = true;
        for(let i = 1; i < this.points.length; i++) {
            const currentStationNumber = this.points[i].properties.index;
            const previousStationNumber = this.points[i-1].properties.index;
            logger.debug('Point ' + (i-1));
            if (currentStationNumber === null) {
                logger.debug('Not checking order for unrecognized point: ' + this.points[i].properties.name);
            } else if (previousStationNumber === null) {
                logger.debug('Not checking order for unrecognized point: ' + this.points[i-1].properties.name);
            } else if (this.pathCircular &&
                (
                    (previousStationNumber === CONSTS.FIRST_STATION_INDEX && currentStationNumber === CONSTS.LAST_STATION_INDEX) ||
                    (currentStationNumber === CONSTS.FIRST_STATION_INDEX && previousStationNumber === CONSTS.LAST_STATION_INDEX)
                )
            )
            {
                logger.debug('Not checking order for station', CONSTS.FIRST_STATION_INDEX, 'and', CONSTS.LAST_STATION_INDEX, 'when route is circular.');
            } else if (currentStationNumber <= previousStationNumber) {
                logger.warn('Detected invalid order of stations. Station ' + currentStationNumber + ' is after station ' + previousStationNumber + '.');
                result = false;
            } else {
                logger.debug('Station ' + currentStationNumber + ' is after station ' + previousStationNumber + '.');
            }
        }
        return result
    }

    areAllOnThePath (maximumDistanceFromPath) {
        let result = true;

        _.forEach(this.points, (station, index) => {
            const stationNumber = station.properties.index;
            const distanceFromStationToPath = station.properties.nearestOnLine.properties.dist;
            logger.debug('Point ' + index);
            if (stationNumber === null) {
                logger.debug('Not checking distance for: ' + station.properties.name);
            } else if (distanceFromStationToPath > maximumDistanceFromPath) {
                logger.warn('Station ' + stationNumber + ' is too far from path. Expected maximum distance from path: ' + maximumDistanceFromPath + ' meter(s).');
                result = false;
            } else {
                logger.debug('Station ' + stationNumber + ' is on the path.');
            }
        });

        return result;
    }

    isPathReversed () {
        return this.pathReversed;
    }

}

