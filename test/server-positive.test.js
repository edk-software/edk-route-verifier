import { callVerifyApi, readKmlFile } from './server-common';

describe('Server - Positive verification', () => {
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
