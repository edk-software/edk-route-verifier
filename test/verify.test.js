import { readFileSync } from 'fs';
import { join } from 'path';
import request from 'request-promise-native';

const callVerifyApi = kml =>
    request.post({
        method: 'POST',
        uri: 'http://localhost:9102/api/verify',
        body: { kml },
        json: true
    });

const readKmlFile = name => {
    const kmlFilesPath = './test/resources';
    const kmlFilesExtension = '.kml';
    return readFileSync(join(kmlFilesPath, `${name}${kmlFilesExtension}`), 'utf8');
};

expect.extend({
    toBeWithinRange(received, rangeSize) {
        const floor = received - rangeSize / 2;
        const ceiling = received + rangeSize / 2;
        const pass = received >= floor && received <= ceiling;
        if (pass) {
            return {
                message: () => `expected ${received} not to be within range ${floor} - ${ceiling}`,
                pass: true
            };
        }
        return {
            message: () => `expected ${received} to be within range ${floor} - ${ceiling}`,
            pass: false
        };
    }
});

describe('Positive', () => {
    test('Regular path', () =>
        new Promise(done =>
            callVerifyApi(readKmlFile('01-regular')).then(({ verificationStatus }) => {
                expect(verificationStatus.singlePath.valid).toEqual(true);
                expect(verificationStatus.pathLength.value).toBeWithinRange(52, 0.5);
                expect(verificationStatus.routeType.valid).toEqual(true);
                expect(verificationStatus.routeType.value).toEqual(0);
                expect(verificationStatus.numberOfStations.valid).toEqual(true);
                expect(verificationStatus.stationsOrder.valid).toEqual(true);
                expect(verificationStatus.stationsOnPath.valid).toEqual(true);
                expect(verificationStatus.elevationGain.value).toBeWithinRange(350, 50);
                expect(verificationStatus.elevationLoss.value).toBeWithinRange(390, 50);
                expect(verificationStatus.elevationTotalChange.value).toBeWithinRange(750, 50);
                done();
            })
        ));

    test('Circular route', () =>
        new Promise(done =>
            callVerifyApi(readKmlFile('02-circular')).then(({ verificationStatus }) => {
                expect(verificationStatus.singlePath.valid).toEqual(true);
                expect(verificationStatus.pathLength.value).toBeWithinRange(37, 0.5);
                expect(verificationStatus.routeType.valid).toEqual(true);
                expect(verificationStatus.routeType.value).toEqual(0);
                expect(verificationStatus.numberOfStations.valid).toEqual(true);
                expect(verificationStatus.stationsOrder.valid).toEqual(true);
                expect(verificationStatus.stationsOnPath.valid).toEqual(true);
                expect(verificationStatus.elevationGain.value).toBeWithinRange(1580, 50);
                expect(verificationStatus.elevationLoss.value).toBeWithinRange(1580, 50);
                expect(verificationStatus.elevationTotalChange.value).toBeWithinRange(3160, 50);
                done();
            })
        ));

    // FIXME: Change to negative or update position
    test('Zero-leading station numbers', () =>
        new Promise(done =>
            callVerifyApi(readKmlFile('03-zero_leading')).then(({ verificationStatus }) => {
                expect(verificationStatus.singlePath.valid).toEqual(true);
                expect(verificationStatus.pathLength.value).toBeWithinRange(76, 0.5);
                expect(verificationStatus.routeType.valid).toEqual(true);
                expect(verificationStatus.routeType.value).toEqual(0);
                expect(verificationStatus.numberOfStations.valid).toEqual(true);
                expect(verificationStatus.stationsOrder.valid).toEqual(true);
                expect(verificationStatus.stationsOnPath.valid).toEqual(false);
                expect(verificationStatus.elevationGain.value).toBeWithinRange(1610, 100);
                expect(verificationStatus.elevationLoss.value).toBeWithinRange(1380, 100);
                expect(verificationStatus.elevationTotalChange.value).toBeWithinRange(3000, 100);
                done();
            })
        ));

    test('Route with shared parts #1', () =>
        new Promise(done =>
            callVerifyApi(readKmlFile('04-shared_parts')).then(({ verificationStatus }) => {
                expect(verificationStatus.singlePath.valid).toEqual(true);
                expect(verificationStatus.pathLength.value).toBeWithinRange(49, 0.5);
                expect(verificationStatus.routeType.valid).toEqual(true);
                expect(verificationStatus.routeType.value).toEqual(0);
                expect(verificationStatus.numberOfStations.valid).toEqual(true);
                expect(verificationStatus.stationsOrder.valid).toEqual(true);
                expect(verificationStatus.stationsOnPath.valid).toEqual(true);
                expect(verificationStatus.elevationGain.value).toBeWithinRange(390, 100);
                expect(verificationStatus.elevationLoss.value).toBeWithinRange(395, 100);
                expect(verificationStatus.elevationTotalChange.value).toBeWithinRange(785, 100);
                done();
            })
        ));

    test('Route with shared parts #2', () =>
        new Promise(done =>
            callVerifyApi(readKmlFile('05-shared_parts')).then(({ verificationStatus }) => {
                expect(verificationStatus.singlePath.valid).toEqual(true);
                expect(verificationStatus.pathLength.value).toBeWithinRange(53, 0.5);
                expect(verificationStatus.routeType.valid).toEqual(true);
                expect(verificationStatus.routeType.value).toEqual(0);
                expect(verificationStatus.numberOfStations.valid).toEqual(true);
                expect(verificationStatus.stationsOrder.valid).toEqual(true);
                expect(verificationStatus.stationsOnPath.valid).toEqual(true);
                expect(verificationStatus.elevationGain.value).toBeWithinRange(410, 100);
                expect(verificationStatus.elevationLoss.value).toBeWithinRange(410, 100);
                expect(verificationStatus.elevationTotalChange.value).toBeWithinRange(820, 100);
                done();
            })
        ));

    test('Stations in reversed order comparing to path direction', () =>
        new Promise(done =>
            callVerifyApi(readKmlFile('06-reversed_path')).then(({ verificationStatus }) => {
                expect(verificationStatus.singlePath.valid).toEqual(true);
                expect(verificationStatus.pathLength.value).toBeWithinRange(44, 0.5);
                expect(verificationStatus.routeType.valid).toEqual(true);
                expect(verificationStatus.routeType.value).toEqual(0);
                expect(verificationStatus.numberOfStations.valid).toEqual(true);
                expect(verificationStatus.stationsOrder.valid).toEqual(true);
                expect(verificationStatus.stationsOnPath.valid).toEqual(true);
                expect(verificationStatus.elevationGain.value).toBeWithinRange(920, 100);
                expect(verificationStatus.elevationLoss.value).toBeWithinRange(880, 100);
                expect(verificationStatus.elevationTotalChange.value).toBeWithinRange(1800, 100);
                done();
            })
        ));

    test('Circular path', () =>
        new Promise(done =>
            callVerifyApi(readKmlFile('12-circular_path')).then(({ verificationStatus }) => {
                expect(verificationStatus.singlePath.valid).toEqual(true);
                expect(verificationStatus.pathLength.value).toBeWithinRange(37, 0.5);
                expect(verificationStatus.routeType.valid).toEqual(true);
                expect(verificationStatus.routeType.value).toEqual(0);
                expect(verificationStatus.numberOfStations.valid).toEqual(true);
                expect(verificationStatus.stationsOrder.valid).toEqual(true);
                expect(verificationStatus.stationsOnPath.valid).toEqual(true);
                expect(verificationStatus.elevationGain.value).toBeWithinRange(1600, 100);
                expect(verificationStatus.elevationLoss.value).toBeWithinRange(1600, 100);
                expect(verificationStatus.elevationTotalChange.value).toBeWithinRange(3200, 100);
                done();
            })
        ));

    // FIXME: Currently it is positive, unrecognized points are not counted as stations
    test('15 stations', () =>
        new Promise(done =>
            callVerifyApi(readKmlFile('22-15_stations')).then(({ verificationStatus }) => {
                expect(verificationStatus.singlePath.valid).toEqual(true);
                expect(verificationStatus.pathLength.value).toBeWithinRange(40, 1);
                expect(verificationStatus.routeType.valid).toEqual(true);
                expect(verificationStatus.routeType.value).toEqual(0);
                expect(verificationStatus.numberOfStations.valid).toEqual(true);
                expect(verificationStatus.stationsOrder.valid).toEqual(true);
                expect(verificationStatus.stationsOnPath.valid).toEqual(true);
                expect(verificationStatus.elevationGain.value).toBeWithinRange(313, 50);
                expect(verificationStatus.elevationLoss.value).toBeWithinRange(314, 50);
                expect(verificationStatus.elevationTotalChange.value).toBeWithinRange(627, 50);
                done();
            })
        ));

    test('Short distance between station 1 and 14', () =>
        new Promise(done =>
            callVerifyApi(readKmlFile('24-Short_distance_between_1_14')).then(({ verificationStatus }) => {
                expect(verificationStatus.singlePath.valid).toEqual(true);
                expect(verificationStatus.pathLength.value).toBeWithinRange(40, 1);
                expect(verificationStatus.routeType.valid).toEqual(true);
                expect(verificationStatus.routeType.value).toEqual(0);
                expect(verificationStatus.numberOfStations.valid).toEqual(true);
                expect(verificationStatus.stationsOrder.valid).toEqual(true);
                expect(verificationStatus.stationsOnPath.valid).toEqual(true);
                expect(verificationStatus.elevationGain.value).toBeWithinRange(327, 50);
                expect(verificationStatus.elevationLoss.value).toBeWithinRange(328, 50);
                expect(verificationStatus.elevationTotalChange.value).toBeWithinRange(650, 50);
                done();
            })
        ));

    test('Eight-shaped route', () =>
        new Promise(done =>
            callVerifyApi(readKmlFile('25-eight_shaped_route')).then(({ verificationStatus }) => {
                expect(verificationStatus.singlePath.valid).toEqual(true);
                expect(verificationStatus.pathLength.value).toBeWithinRange(52, 1);
                expect(verificationStatus.routeType.valid).toEqual(true);
                expect(verificationStatus.routeType.value).toEqual(0);
                expect(verificationStatus.numberOfStations.valid).toEqual(true);
                expect(verificationStatus.stationsOrder.valid).toEqual(true);
                expect(verificationStatus.stationsOnPath.valid).toEqual(true);
                expect(verificationStatus.elevationGain.value).toBeWithinRange(385, 50);
                expect(verificationStatus.elevationLoss.value).toBeWithinRange(385, 50);
                expect(verificationStatus.elevationTotalChange.value).toBeWithinRange(750, 50);
                done();
            })
        ));
});

describe('Negative', () => {
    test('Duplicated station point', () =>
        new Promise(done =>
            callVerifyApi(readKmlFile('10-duplicated_station_point')).then(({ verificationStatus }) => {
                expect(verificationStatus.singlePath.valid).toEqual(true);
                expect(verificationStatus.pathLength.value).toBeWithinRange(29, 0.5);
                expect(verificationStatus.routeType.valid).toEqual(true);
                expect(verificationStatus.routeType.value).toEqual(1);
                expect(verificationStatus.numberOfStations.valid).toEqual(false);
                expect(verificationStatus.stationsOrder.valid).toEqual(false);
                expect(verificationStatus.stationsOnPath.valid).toEqual(true);
                expect(verificationStatus.elevationGain.value).toBeWithinRange(190, 50);
                expect(verificationStatus.elevationLoss.value).toBeWithinRange(145, 50);
                expect(verificationStatus.elevationTotalChange.value).toBeWithinRange(335, 50);
                done();
            })
        ));

    test('Station out of path', () =>
        new Promise(done =>
            callVerifyApi(readKmlFile('11-station_out_of_path')).then(({ verificationStatus }) => {
                expect(verificationStatus.singlePath.valid).toEqual(true);
                expect(verificationStatus.pathLength.value).toBeWithinRange(44, 1);
                expect(verificationStatus.routeType.valid).toEqual(true);
                expect(verificationStatus.routeType.value).toEqual(0);
                expect(verificationStatus.numberOfStations.valid).toEqual(true);
                expect(verificationStatus.stationsOrder.valid).toEqual(true);
                expect(verificationStatus.stationsOnPath.valid).toEqual(false);
                expect(verificationStatus.elevationGain.value).toBeWithinRange(320, 50);
                expect(verificationStatus.elevationLoss.value).toBeWithinRange(380, 50);
                expect(verificationStatus.elevationTotalChange.value).toBeWithinRange(700, 50);
                done();
            })
        ));

    test('One path and no stations', () =>
        new Promise(done =>
            callVerifyApi(readKmlFile('14-one_path_no_stations')).then(({ verificationStatus }) => {
                expect(verificationStatus.singlePath.valid).toEqual(true);
                expect(verificationStatus.pathLength.value).toBeWithinRange(44, 1);
                expect(verificationStatus.routeType.valid).toEqual(true);
                expect(verificationStatus.routeType.value).toEqual(0);
                expect(verificationStatus.numberOfStations.valid).toEqual(false);
                expect(verificationStatus.stationsOrder.valid).toEqual(true);
                expect(verificationStatus.stationsOnPath.valid).toEqual(true);
                expect(verificationStatus.elevationGain.value).toBeWithinRange(220, 50);
                expect(verificationStatus.elevationLoss.value).toBeWithinRange(200, 50);
                expect(verificationStatus.elevationTotalChange.value).toBeWithinRange(420, 50);
                done();
            })
        ));

    // TODO: Fix
    test('No lineString tag in KML file', () =>
        new Promise(done =>
            callVerifyApi(readKmlFile('15_no_path')).then(({ verificationStatus }) => {
                expect(verificationStatus.singlePath.valid).toEqual(false);
                expect(verificationStatus.routeType.valid).toEqual(false);
                expect(verificationStatus.routeType.value).toEqual(2);
                expect(verificationStatus.numberOfStations.valid).toEqual(false);
                expect(verificationStatus.stationsOrder.valid).toEqual(false);
                expect(verificationStatus.stationsOnPath.valid).toEqual(false);
                expect(verificationStatus.elevationGain.value).toBeWithinRange(220, 50);
                expect(verificationStatus.elevationLoss.value).toBeWithinRange(200, 50);
                expect(verificationStatus.elevationTotalChange.value).toBeWithinRange(420, 50);
                done();
            })
        ));

    test('Duplicated path', () =>
        new Promise(done =>
            callVerifyApi(readKmlFile('20-duplicated_path')).then(({ verificationStatus }) => {
                expect(verificationStatus.singlePath.valid).toEqual(false);
                expect(verificationStatus.pathLength.value).toBeWithinRange(52, 1);
                expect(verificationStatus.routeType.valid).toEqual(true);
                expect(verificationStatus.routeType.value).toEqual(0);
                expect(verificationStatus.numberOfStations.valid).toEqual(true);
                expect(verificationStatus.stationsOrder.valid).toEqual(true);
                expect(verificationStatus.stationsOnPath.valid).toEqual(true);
                expect(verificationStatus.elevationGain.value).toBeWithinRange(350, 50);
                expect(verificationStatus.elevationLoss.value).toBeWithinRange(390, 50);
                expect(verificationStatus.elevationTotalChange.value).toBeWithinRange(740, 50);
                done();
            })
        ));

    test('Two paths', () =>
        new Promise(done =>
            callVerifyApi(readKmlFile('21-two_path')).then(({ verificationStatus }) => {
                expect(verificationStatus.singlePath.valid).toEqual(false);
                expect(verificationStatus.pathLength.value).toBeWithinRange(24, 1);
                expect(verificationStatus.routeType.valid).toEqual(true);
                expect(verificationStatus.routeType.value).toEqual(1);
                expect(verificationStatus.numberOfStations.valid).toEqual(true);
                expect(verificationStatus.stationsOrder.valid).toEqual(true);
                expect(verificationStatus.stationsOnPath.valid).toEqual(false);
                expect(verificationStatus.elevationGain.value).toBeWithinRange(250, 50);
                expect(verificationStatus.elevationLoss.value).toBeWithinRange(260, 50);
                expect(verificationStatus.elevationTotalChange.value).toBeWithinRange(520, 50);
                done();
            })
        ));

    test('13 stations', () =>
        new Promise(done =>
            callVerifyApi(readKmlFile('23-13_stations')).then(({ verificationStatus }) => {
                expect(verificationStatus.singlePath.valid).toEqual(true);
                expect(verificationStatus.pathLength.value).toBeWithinRange(40, 1);
                expect(verificationStatus.routeType.valid).toEqual(true);
                expect(verificationStatus.routeType.value).toEqual(0);
                expect(verificationStatus.numberOfStations.valid).toEqual(false);
                expect(verificationStatus.stationsOrder.valid).toEqual(true);
                expect(verificationStatus.stationsOnPath.valid).toEqual(true);
                expect(verificationStatus.elevationGain.value).toBeWithinRange(313, 50);
                expect(verificationStatus.elevationLoss.value).toBeWithinRange(314, 50);
                expect(verificationStatus.elevationTotalChange.value).toBeWithinRange(627, 50);
                done();
            })
        ));
});
