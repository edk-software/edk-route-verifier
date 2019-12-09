import xmlDom from 'xmldom';
import toGeoJSON from '@mapbox/togeojson';
import logger from 'loglevel';
import { flatten } from './turf.js';
import { getClient } from './googleMaps.js';
import * as _ from './lodash.js';
import KMLError from '../errors/KMLError.js';
import GoogleMapsApiError from '../errors/GoogleMapsApiError.js';

export default class Helpers {
    static getGeoJSON(kmlString) {
        const domParser = new xmlDom.DOMParser({
            errorHandler: {
                warning(w) {
                    logger.warn(`KML parsing warning: ${w}`);
                },
                error: error => {
                    logger.error(`KML parsing error: ${error}`);
                    throw new KMLError(kmlString);
                },
                fatalError: error => {
                    logger.error(`KML parsing fatal error: ${error}`);
                    throw new KMLError(kmlString);
                }
            }
        });
        const kml = domParser.parseFromString(kmlString, 'text/xml');
        const extendedData = kml.getElementsByTagName('ExtendedData');
        for (let index = extendedData.length - 1; index >= 0; index -= 1) {
            extendedData[index].parentNode.removeChild(extendedData[index]);
        }
        logger.log('KML (no ExtendedData):', kml);

        let geoJson = toGeoJSON.kml(kml);
        geoJson = flatten(geoJson);
        logger.log('GeoJSON (flatten): ', geoJson);

        return geoJson;
    }

    static getNumberOfFeatures(featureName, geoJson) {
        const features = _.filter(geoJson.features, feature => _.isEqual(feature.geometry.type, featureName));
        return features.length;
    }

    static getLineString(geoJson) {
        return _.find(geoJson.features, feature => _.isEqual(feature.geometry.type, 'LineString'));
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
        return _.filter(geoJson.features, feature => _.isEqual(feature.geometry.type, 'Point'));
    }

    static getGoogleMapsLatLng(coordinates) {
        return [coordinates[1], coordinates[0]];
    }

    static getGoogleMapsPath(lineString) {
        return _.map(lineString.geometry.coordinates, element => Helpers.getGoogleMapsLatLng(element));
    }

    static getPathElevations(lineString) {
        let path = this.getGoogleMapsPath(lineString);

        // Optimize path array length
        // This is done to send no more than
        // MAXIMUM_NUMBER_OF_LATLNG_OBJECTS coordinates in KML path
        const MAXIMUM_NUMBER_OF_SAMPLES = 512;
        // Request to google.maps.ElevationService cannot be too long (2048 is too long)
        const MAXIMUM_NUMBER_OF_LATLNG_OBJECTS = 256;
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

        try {
            return getClient()
                .elevationAlongPath({ path, samples: MAXIMUM_NUMBER_OF_SAMPLES })
                .asPromise()
                .then(response => response.json.results);
        } catch (error) {
            throw new GoogleMapsApiError('Cannot get Google Maps API client.');
        }
    }
}
