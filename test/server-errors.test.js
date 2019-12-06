import { callVerifyApi, readKmlFile } from './server-common';

describe('Server - Errors', () => {
    test('Invalid input - KML - undefined', () =>
        new Promise(done =>
            callVerifyApi(undefined).catch(statusCodeError => {
                expect(statusCodeError.statusCode).toEqual(400);
                expect(statusCodeError.error.message).toEqual('Provided KML string input is invalid.');
                expect(statusCodeError.error.error).toEqual('KMLError');
                done();
            })
        ));

    test('Invalid input - KML - truncated XML', () =>
        new Promise(done =>
            callVerifyApi(
                '<?xml version="1.0" encoding="UTF-8"?>\n' +
                    '<kml xmlns="http://www.opengis.net/kml/2.2">\n' +
                    '  <Document>\n' +
                    '    <name>P-EDK Kalwaria+</name>\n' +
                    '    <description/>\n' +
                    '    <Style id="icon-123-nodesc-normal">'
            ).catch(statusCodeError => {
                expect(statusCodeError.statusCode).toEqual(400);
                expect(statusCodeError.error.message).toEqual('No path is defined in provided KML string.');
                expect(statusCodeError.error.error).toEqual('NoPathInRouteError');
                done();
            })
        ));

    test('Invalid input - KML - empty', () =>
        new Promise(done =>
            callVerifyApi('').catch(statusCodeError => {
                expect(statusCodeError.statusCode).toEqual(400);
                expect(statusCodeError.error.message).toEqual('Provided KML string input is invalid.');
                expect(statusCodeError.error.error).toEqual('KMLError');
                done();
            })
        ));

    test('Invalid input - KML - no path', () =>
        new Promise(done =>
            callVerifyApi(readKmlFile('15_no_path')).catch(statusCodeError => {
                expect(statusCodeError.statusCode).toEqual(400);
                expect(statusCodeError.error.message).toEqual('No path is defined in provided KML string.');
                expect(statusCodeError.error.error).toEqual('NoPathInRouteError');
                done();
            })
        ));
});
