import toGeoJSON from 'togeojson';
import flatten from '@turf/flatten';
import logger from './loglevel';
import * as _ from './lodash';


export default class Helpers {
    static getGeoJSON(kml) {
        const extendedData = kml.getElementsByTagName('ExtendedData');
        for (let index = extendedData.length - 1; index >= 0; index--) {
            extendedData[index].parentNode.removeChild(extendedData[index]);
        }
        logger.log('KML (no ExtendedData):', kml);

        let geoJson = toGeoJSON.kml(kml);
        geoJson = flatten(geoJson);
        logger.log('GeoJSON (flatten): ', geoJson);

        return geoJson;
    }

    static getNumberOfFeatures(featureName, geoJson) {
        const features = _.filter(geoJson.features,
            feature => _.isEqual(feature.geometry.type, featureName));
        return features.length;
    }

    static getLineString(geoJson) {
        const lineString = _.find(geoJson.features,
            feature => _.isEqual(feature.geometry.type, 'LineString'));
        return lineString;
    }

    static getDistanceToNearestPointOnLine(point) {
        return _.get(point, 'properties.nearestOnLine.properties.dist', Number.MAX_VALUE);
    }

    static getLocationOfNearestPointOnLine(point) {
        return _.get(point, 'properties.nearestOnLine.properties.location', 0);
    }

    static reverseLineString(lineString) {
        const newLineString = { ...lineString };
        newLineString.geometry.coordinates = lineString.geometry.coordinates.reverse();
        return newLineString;
    }

    static getPoints(geoJson) {
        const points = _.filter(geoJson.features,
            feature => _.isEqual(feature.geometry.type, 'Point'));
        return points;
    }

    static getRoute(routeUrl) {
        logger.debug('Fetching route from:', routeUrl);
        return $.ajax(routeUrl);
    }

    static getGoogleMapsLatLng(coordinates) {
        return new google.maps.LatLng(coordinates[1], coordinates[0]);
    }

    static getGoogleMapsPath(lineString) {
        const path = _.map(lineString.geometry.coordinates,
            element => Helpers.getGoogleMapsLatLng(element));
        return path;
    }

    static getPathElevations(lineString, useLocalElevations) {
        if (useLocalElevations && lineString.geometry.coordinates[0].length === 3) {
            // Elevation present in line string

            logger.debug('Getting path elevations from line string...');
            const elevations = _.map(lineString.geometry.coordinates,
                element => ({ elevation: element[2] }));
            logger.debug('Elevations:', elevations);
            return new Promise((resolve, reject) => {
                resolve(elevations);
            });
        }
        // No elevation in line string
        let path = this.getGoogleMapsPath(lineString);

        // Optimize path array length
        // This is done to send no more than
        // MAXIMUM_NUMBER_OF_LATLNG_OBJECTS coordinates in KML path
        const MAXIMUM_NUMBER_OF_SAMPLES = 512;
        // Request to google.maps.ElevationService cannot be too long (2048 is too long)
        const MAXIMUM_NUMBER_OF_LATLNG_OBJECTS = 1024;
        logger.debug('Number of LatLng objects:', path.length);
        if (path.length > MAXIMUM_NUMBER_OF_LATLNG_OBJECTS) {
            const optimizedPath = [];
            const delta = parseFloat(path.length / MAXIMUM_NUMBER_OF_LATLNG_OBJECTS);
            for (let i = 0; i < path.length; i += delta) {
                optimizedPath.push(path[Math.floor(i)]);
            }
            path = optimizedPath;
            logger.debug('Number of LatLng objects after optimization:', path.length);
        }

        return new Promise((resolve, reject) => {
            const elevator = new google.maps.ElevationService();
            elevator.getElevationAlongPath({
                path,
                samples: MAXIMUM_NUMBER_OF_SAMPLES,
            }, (elevations, status) => {
                if (status === google.maps.ElevationStatus.OK) {
                    resolve(elevations);
                } else {
                    reject(status);
                }
            });
        });
    }

    static getRouteParameters(routeParamsUrl) {
        return new Promise((resolve, reject) => {
            $.ajax(routeParamsUrl)
                .done(data => {
                    logger.debug('Route parameters:', data);
                    if (data.success === 1) {
                        resolve(data);
                    } else {
                        reject(`Server side error: ${data.error}`);
                    }
                })
                .fail((xhr, status) => {
                    reject(status);
                });
        });
    }

    static approveRoute(routeApproveUrl) {
        return new Promise((resolve, reject) => {
            $.ajax(routeApproveUrl)
                .done(data => {
                    resolve({ success: true });
                })
                .fail((xhr, status) => {
                    reject(status);
                });
        });
    }
}