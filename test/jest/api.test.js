import request from 'supertest';
import { createServer } from '../../src/server/server';
import { readKmlFile, readJsonFile, initializeVerificationEnvironment } from './common';

function createAPIServer(config = readJsonFile('./conf/config.json'), language = 'en') {
    const testServerPort = 9103;
    initializeVerificationEnvironment(config, language);
    return createServer(testServerPort, false, false);
}

function callVerifyApi(app, body, { apiUser, apiPass } = readJsonFile('./conf/config.json')) {
    return request(app)
        .post('/api/verify')
        .send(body)
        .auth(apiUser, apiPass)
        .set('Accept', 'application/json');
}

describe('API', () => {
    const routeCharacteristics = expect.objectContaining({
        elevationCharacteristics: expect.arrayContaining([
            expect.objectContaining({
                distance: expect.any(Number),
                elevation: expect.any(Number)
            })
        ]),
        pathStart: {
            latitude: expect.any(Number),
            longitude: expect.any(Number)
        },
        pathEnd: {
            latitude: expect.any(Number),
            longitude: expect.any(Number)
        },
        pathCoordinates: expect.arrayContaining([
            expect.objectContaining({
                latitude: expect.any(Number),
                longitude: expect.any(Number)
            })
        ]),
        stations: expect.arrayContaining([
            expect.objectContaining({
                index: expect.any(Number),
                latitude: expect.any(Number),
                longitude: expect.any(Number)
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

    test('Verification successful', async () => {
        const app = createAPIServer();
        const response = await callVerifyApi(app, { kml: readKmlFile('regular') });
        const { status, body: verificationOutput } = response;

        expect(status).toEqual(200);

        const expected = expect.objectContaining({
            routeCharacteristics,
            verificationStatus: verificationStatusSuccessful
        });
        expect(verificationOutput).toEqual(expectedRouteCharacteristics);
        expect(verificationOutput).toEqual(expectedVerificationStatusSuccessful);
        expect(verificationOutput).toStrictEqual(expected);
    });

    test('Verification failed', async () => {
        const app = createAPIServer();
        const response = await callVerifyApi(app, { kml: readKmlFile('two_paths') });
        const { status, body: verificationOutput } = response;

        expect(status).toEqual(200);

        const expected = expect.objectContaining({
            routeCharacteristics,
            verificationStatus: verificationStatusFailed
        });

        expect(verificationOutput).toEqual(expectedRouteCharacteristics);
        expect(verificationOutput).toEqual(expectedVerificationStatusFailed);
        expect(verificationOutput).toStrictEqual(expected);
    });

    test('Invalid input - KML - invalid KML', async () => {
        const app = createAPIServer();
        const response = await callVerifyApi(app, { kml: '<<>>>>>' });

        const { status, body: error } = response;

        expect(status).toEqual(400);
        expect(error.message).toEqual('Provided KML string input is invalid.');
        expect(error.error).toEqual('KMLError');
    });

    test('Invalid input - KML - truncated XML', async () => {
        const app = createAPIServer();
        const response = await callVerifyApi(app, {
            kml:
                '<?xml version="1.0" encoding="UTF-8"?>\n' +
                '<kml xmlns="http://www.opengis.net/kml/2.2">\n' +
                '  <Document>\n' +
                '    <name>P-EDK Kalwaria+</name>\n' +
                '    <description/>\n' +
                '    <Style id="icon-123-nodesc-normal">'
        });

        const { status, body: error } = response;

        expect(status).toEqual(400);
        expect(error.message).toEqual('No path is defined in provided KML string.');
        expect(error.error).toEqual('NoPathInRouteError');
    });

    test('Invalid input - KML - no path', async () => {
        const app = createAPIServer();
        const response = await callVerifyApi(app, { kml: readKmlFile('no_path') });

        const { status, body: error } = response;

        expect(status).toEqual(400);
        expect(error.message).toEqual('No path is defined in provided KML string.');
        expect(error.error).toEqual('NoPathInRouteError');
    });

    test('Invalid input - only kml parameter - empty', async () => {
        const app = createAPIServer();
        const response = await callVerifyApi(app, { kml: '' });

        const { status, body: error } = response;

        expect(status).toEqual(400);
        expect(error.message).toEqual(
            "None of the following parameters ('kml', 'file') properly provided in the request."
        );
        expect(error.error).toEqual('FileError');
    });

    test('Invalid input - only file parameter - empty', async () => {
        const app = createAPIServer();
        const response = await callVerifyApi(app, { file: '' });

        const { status, body: error } = response;

        expect(status).toEqual(400);
        expect(error.message).toEqual(
            "None of the following parameters ('kml', 'file') properly provided in the request."
        );
        expect(error.error).toEqual('FileError');
    });

    test('Invalid input - none of the parameters provided', async () => {
        const app = createAPIServer();
        const response = await callVerifyApi(app);

        const { status, body: error } = response;

        expect(status).toEqual(400);
        expect(error.message).toEqual(
            "None of the following parameters ('kml', 'file') properly provided in the request."
        );
        expect(error.error).toEqual('FileError');
    });

    test('File error - kml and file provided empty', async () => {
        const app = createAPIServer();
        const response = await callVerifyApi(app, { kml: '', file: '' });

        const { status, body: error } = response;

        expect(status).toEqual(400);
        expect(error.message).toEqual(
            "None of the following parameters ('kml', 'file') properly provided in the request."
        );
        expect(error.error).toEqual('FileError');
    });

    test('File error - file does not exist', async () => {
        const app = createAPIServer();
        const response = await callVerifyApi(app, { file: 'abc.kml' });

        const { status, body: error } = response;

        expect(status).toEqual(400);
        expect(error.message).toEqual("File 'abc.kml' does not exist in resources path.");
        expect(error.error).toEqual('FileError');
    });

    test('File error - file outside of resources path', async () => {
        const app = createAPIServer();
        const response = await callVerifyApi(app, { file: '../abc.kml' });

        const { status, body: error } = response;

        expect(status).toEqual(400);
        expect(error.message).toEqual('Access to files outside of configured resources path is forbidden.');
        expect(error.error).toEqual('FileError');
    });

    test('Unauthorized access', async () => {
        const app = createAPIServer();
        const response = await callVerifyApi(app, {}, { apiUser: '', apiPass: '' });

        const { status, body: error } = response;

        expect(status).toEqual(401);
        expect(error).toEqual({});
    });

    test('Google Maps API error', async () => {
        const app = createAPIServer({ apiUser: '', apiPass: '', googleMapsApiKey: '' });
        const response = await callVerifyApi(app, { kml: readKmlFile('regular') }, { apiUser: '', apiPass: '' });

        const { status, body: error } = response;

        expect(status).toEqual(500);
        expect(error.message).toEqual('Error fetching data from Google Maps API.');
        expect(error.error).toEqual('GoogleMapsApiError');
    });
});
