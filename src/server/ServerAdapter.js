import AbstractOutputAdapter from '../data/AbstractOutputAdapter.js';
import FileError from '../core/errors/FileError.js';
import GoogleMapsApiError from '../core/errors/GoogleMapsApiError.js';
import KMLError from '../core/errors/KMLError.js';
import NoPathInRouteError from '../core/errors/NoPathInRouteError.js';
import InvalidInputError from '../core/errors/InvalidInputError.js';
import Lang from '../core/lang/Lang.js';

export default class ServerAdapter extends AbstractOutputAdapter {
    get() {
        const output = this.verificationOutput;
        return {
            routeCharacteristics: {
                elevationCharacteristics: output.getElevationCharacteristics(),
                pathStart: output.getPathStart(),
                pathEnd: output.getPathEnd(),
                pathCoordinates: output.getPathCoordinates(),
                stations: output.getStations()
            },
            verificationStatus: {
                singlePath: {
                    valid: output.getSinglePathStatus()
                },
                pathLength: {
                    valid: output.getPathLengthStatus(),
                    value: output.getPathLength()
                },
                routeType: {
                    valid: output.getRouteTypeStatus(),
                    value: output.getRouteType()
                },
                numberOfStations: {
                    valid: output.getNumberOfStationsStatus()
                },
                stationsOrder: {
                    valid: output.getStationsOrderStatus()
                },
                stationsOnPath: {
                    valid: output.getStationsOnPathStatus()
                },
                elevationGain: {
                    valid: output.getElevationGainStatus(),
                    value: output.getElevationGain()
                },
                elevationLoss: {
                    valid: true,
                    value: output.getElevationLoss()
                },
                elevationTotalChange: {
                    valid: true,
                    value: output.getElevationTotalChange()
                },
                logs: output.getLogs()
            }
        };
    }

    static handleError(error, res) {
        const lang = Lang.getInstance();

        if (error instanceof KMLError) {
            return res.status(400).send({
                error: error.name,
                message: lang.trans('Provided KML string input is invalid')
            });
        }
        if (error instanceof FileError) {
            return res.status(400).send({
                error: error.name,
                message: lang.trans(error.message, { file: error.filename })
            });
        }
        if (error instanceof NoPathInRouteError) {
            return res.status(400).send({
                error: error.name,
                message: lang.trans('No path is defined in provided KML string')
            });
        }
        if (error instanceof GoogleMapsApiError) {
            return res.status(500).send({
                error: error.name,
                message: lang.trans('Error fetching data from Google Maps API')
            });
        }
        if (error instanceof InvalidInputError) {
            return res.status(500).send({
                error: error.name,
                message: lang.trans('Provided verification inputs are invalid')
            });
        }
        return res.status(500).send({
            error: error.name,
            message: lang.trans('Unexpected internal server error')
        });
    }
}
