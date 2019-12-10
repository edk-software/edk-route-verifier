import { callVerifyApi, initializeVerificationEnvironment, readKmlFile, startAPIServer, stopAPIServer } from './common';

describe('API', () => {
    const routeCharacteristics = expect.objectContaining({
        elevationCharacteristics: expect.arrayContaining([
            expect.objectContaining({
                distance: expect.any(Number),
                elevation: expect.any(Number)
            })
        ])
    });
    const expectedRouteCharacteristics = expect.objectContaining({
        routeCharacteristics
    });
    const verificationStatusSuccessful = {
        elevationGain: {
            valid: expect.any(Boolean),
            value: expect.any(Number)
        },
        elevationLoss: {
            valid: expect.any(Boolean),
            value: expect.any(Number)
        },
        elevationTotalChange: {
            valid: expect.any(Boolean),
            value: expect.any(Number)
        },
        logs: [],
        numberOfStations: {
            valid: expect.any(Boolean)
        },
        pathLength: {
            valid: expect.any(Boolean),
            value: expect.any(Number)
        },
        routeType: {
            valid: expect.any(Boolean),
            value: expect.any(Number)
        },
        singlePath: {
            valid: expect.any(Boolean)
        },
        stationsOnPath: {
            valid: expect.any(Boolean)
        },
        stationsOrder: {
            valid: expect.any(Boolean)
        }
    };
    const verificationStatusFailed = {
        ...verificationStatusSuccessful,
        logs: expect.arrayContaining([expect.any(String)])
    };
    const expectedVerificationStatusSuccessful = expect.objectContaining({
        verificationStatus: verificationStatusSuccessful
    });
    const expectedVerificationStatusFailed = expect.objectContaining({
        verificationStatus: verificationStatusFailed
    });

    beforeAll(
        () =>
            new Promise(done => {
                initializeVerificationEnvironment();
                stopAPIServer()
                    .catch(() => {})
                    .then(() => {
                        startAPIServer();
                        done();
                    });
            })
    );

    test('Verification successful', async () => {
        const verificationOutput = await callVerifyApi(readKmlFile('01-regular'));

        const expected = expect.objectContaining({
            routeCharacteristics,
            verificationStatus: verificationStatusSuccessful
        });

        expect(verificationOutput).toEqual(expectedRouteCharacteristics);
        expect(verificationOutput).toEqual(expectedVerificationStatusSuccessful);
        expect(verificationOutput).toStrictEqual(expected);
    });

    test('Verification failed', async () => {
        const verificationOutput = await callVerifyApi(readKmlFile('21-two_path'));

        const expected = expect.objectContaining({
            routeCharacteristics,
            verificationStatus: verificationStatusFailed
        });

        expect(verificationOutput).toEqual(expectedRouteCharacteristics);
        expect(verificationOutput).toEqual(expectedVerificationStatusFailed);
        expect(verificationOutput).toStrictEqual(expected);
    });

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

    test('Unauthorized access', () =>
        new Promise(done =>
            callVerifyApi('', { apiUser: '', apiPass: '' }).catch(statusCodeError => {
                expect(statusCodeError.statusCode).toEqual(401);
                done();
            })
        ));

    // TODO: Make it works
    // test('Google Maps API error', () => {
    //     const config = Configuration.getConfig();
    //     Configuration.destroy();
    //     // eslint-disable-next-line no-unused-vars
    //     const newConfiguration = new Configuration({ ...config, googleMapsApiKey: '' });
    //
    //     return new Promise(done =>
    //         callVerifyApi(readKmlFile('01-regular')).catch(statusCodeError => {
    //             expect(statusCodeError.statusCode).toEqual(500);
    //             expect(statusCodeError.error.message).toEqual('Error fetching data from Google Maps API.');
    //             expect(statusCodeError.error.error).toEqual('GoogleMapsApiError');
    //             done();
    //         })
    //     );
    // });
});
