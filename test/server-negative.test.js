import { callVerifyApi, readKmlFile } from './server-common';

describe('Server - Negative verification', () => {
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
