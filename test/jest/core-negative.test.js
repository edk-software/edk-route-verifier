import { getVerificationOutputFor, initializeVerificationEnvironment } from './common';

describe('Route verification - negative', () => {
    beforeAll(() => {
        initializeVerificationEnvironment();
    });

    test('Duplicated station point', async () => {
        const { verificationStatus } = await getVerificationOutputFor('duplicated_station_point');
        expect(verificationStatus.singlePath.valid).toEqual(true);
        expect(verificationStatus.pathLength.valid).toEqual(false);
        expect(verificationStatus.pathLength.value).toBeWithinRange(29, 0.5);
        expect(verificationStatus.routeType.valid).toEqual(false);
        expect(verificationStatus.routeType.value).toEqual(2);
        expect(verificationStatus.numberOfStations.valid).toEqual(false);
        expect(verificationStatus.stationsOrder.valid).toEqual(false);
        expect(verificationStatus.stationsOnPath.valid).toEqual(true);
        expect(verificationStatus.elevationGain.value).toBeWithinRange(190, 50);
        expect(verificationStatus.elevationLoss.value).toBeWithinRange(145, 50);
        expect(verificationStatus.elevationTotalChange.value).toBeWithinRange(335, 50);
    });

    test('Station out of path', async () => {
        const { verificationStatus } = await getVerificationOutputFor('station_out_of_path');
        expect(verificationStatus.singlePath.valid).toEqual(true);
        expect(verificationStatus.pathLength.valid).toEqual(true);
        expect(verificationStatus.pathLength.value).toBeWithinRange(44, 1);
        expect(verificationStatus.routeType.valid).toEqual(true);
        expect(verificationStatus.routeType.value).toEqual(0);
        expect(verificationStatus.numberOfStations.valid).toEqual(true);
        expect(verificationStatus.stationsOrder.valid).toEqual(true);
        expect(verificationStatus.stationsOnPath.valid).toEqual(false);
        expect(verificationStatus.elevationGain.value).toBeWithinRange(320, 50);
        expect(verificationStatus.elevationLoss.value).toBeWithinRange(380, 50);
        expect(verificationStatus.elevationTotalChange.value).toBeWithinRange(700, 50);
    });

    test('One path and no stations', async () => {
        const { verificationStatus } = await getVerificationOutputFor('one_path_no_stations');
        expect(verificationStatus.singlePath.valid).toEqual(true);
        expect(verificationStatus.pathLength.valid).toEqual(true);
        expect(verificationStatus.pathLength.value).toBeWithinRange(44, 1);
        expect(verificationStatus.routeType.valid).toEqual(true);
        expect(verificationStatus.routeType.value).toEqual(0);
        expect(verificationStatus.numberOfStations.valid).toEqual(false);
        expect(verificationStatus.stationsOrder.valid).toEqual(true);
        expect(verificationStatus.stationsOnPath.valid).toEqual(true);
        expect(verificationStatus.elevationGain.value).toBeWithinRange(220, 50);
        expect(verificationStatus.elevationLoss.value).toBeWithinRange(200, 50);
        expect(verificationStatus.elevationTotalChange.value).toBeWithinRange(420, 50);
    });

    test('Duplicated path', async () => {
        const { verificationStatus } = await getVerificationOutputFor('duplicated_path');
        expect(verificationStatus.singlePath.valid).toEqual(false);
        expect(verificationStatus.pathLength.valid).toEqual(true);
        expect(verificationStatus.pathLength.value).toBeWithinRange(52, 1);
        expect(verificationStatus.routeType.valid).toEqual(true);
        expect(verificationStatus.routeType.value).toEqual(0);
        expect(verificationStatus.numberOfStations.valid).toEqual(true);
        expect(verificationStatus.stationsOrder.valid).toEqual(true);
        expect(verificationStatus.stationsOnPath.valid).toEqual(true);
        expect(verificationStatus.elevationGain.value).toBeWithinRange(350, 50);
        expect(verificationStatus.elevationLoss.value).toBeWithinRange(390, 50);
        expect(verificationStatus.elevationTotalChange.value).toBeWithinRange(740, 50);
    });

    test('Two paths', async () => {
        const { verificationStatus } = await getVerificationOutputFor('two_paths');
        expect(verificationStatus.singlePath.valid).toEqual(false);
        expect(verificationStatus.pathLength.valid).toEqual(false);
        expect(verificationStatus.pathLength.value).toBeWithinRange(24, 1);
        expect(verificationStatus.routeType.valid).toEqual(false);
        expect(verificationStatus.routeType.value).toEqual(2);
        expect(verificationStatus.numberOfStations.valid).toEqual(true);
        expect(verificationStatus.stationsOrder.valid).toEqual(true);
        expect(verificationStatus.stationsOnPath.valid).toEqual(false);
        expect(verificationStatus.elevationGain.value).toBeWithinRange(250, 50);
        expect(verificationStatus.elevationLoss.value).toBeWithinRange(260, 50);
        expect(verificationStatus.elevationTotalChange.value).toBeWithinRange(520, 50);
    });

    test('13 stations', async () => {
        const { verificationStatus } = await getVerificationOutputFor('13_stations');
        expect(verificationStatus.singlePath.valid).toEqual(true);
        expect(verificationStatus.pathLength.valid).toEqual(true);
        expect(verificationStatus.pathLength.value).toBeWithinRange(40, 1);
        expect(verificationStatus.routeType.valid).toEqual(true);
        expect(verificationStatus.routeType.value).toEqual(0);
        expect(verificationStatus.numberOfStations.valid).toEqual(false);
        expect(verificationStatus.stationsOrder.valid).toEqual(true);
        expect(verificationStatus.stationsOnPath.valid).toEqual(true);
        expect(verificationStatus.elevationGain.value).toBeWithinRange(313, 50);
        expect(verificationStatus.elevationLoss.value).toBeWithinRange(314, 50);
        expect(verificationStatus.elevationTotalChange.value).toBeWithinRange(627, 50);
    });

    test('Two paths + big file test', async () => {
        const { verificationStatus } = await getVerificationOutputFor('big_file');
        expect(verificationStatus.singlePath.valid).toEqual(false);
        expect(verificationStatus.pathLength.valid).toEqual(true);
        expect(verificationStatus.pathLength.value).toBeWithinRange(38.5, 1);
        expect(verificationStatus.routeType.valid).toEqual(true);
        expect(verificationStatus.routeType.value).toEqual(0);
        expect(verificationStatus.numberOfStations.valid).toEqual(true);
        expect(verificationStatus.stationsOrder.valid).toEqual(true);
        expect(verificationStatus.stationsOnPath.valid).toEqual(true);
        expect(verificationStatus.elevationGain.value).toBeWithinRange(965, 50);
        expect(verificationStatus.elevationLoss.value).toBeWithinRange(626, 50);
        expect(verificationStatus.elevationTotalChange.value).toBeWithinRange(1592, 50);
    });

    test('Route with shared parts #1 (currently not supported)', async () => {
        const { verificationStatus } = await getVerificationOutputFor('shared_parts_1');
        expect(verificationStatus.singlePath.valid).toEqual(true);
        expect(verificationStatus.pathLength.valid).toEqual(true);
        expect(verificationStatus.pathLength.value).toBeWithinRange(49, 0.5);
        expect(verificationStatus.routeType.valid).toEqual(true);
        expect(verificationStatus.routeType.value).toEqual(0);
        expect(verificationStatus.numberOfStations.valid).toEqual(true);
        expect(verificationStatus.stationsOrder.valid).toEqual(false);
        expect(verificationStatus.stationsOnPath.valid).toEqual(true);
        expect(verificationStatus.elevationGain.value).toBeWithinRange(390, 100);
        expect(verificationStatus.elevationLoss.value).toBeWithinRange(395, 100);
        expect(verificationStatus.elevationTotalChange.value).toBeWithinRange(785, 100);
    });

    test('Route with shared parts #2 (currently not supported)', async () => {
        const { verificationStatus } = await getVerificationOutputFor('shared_parts_2');
        expect(verificationStatus.singlePath.valid).toEqual(true);
        expect(verificationStatus.pathLength.valid).toEqual(true);
        expect(verificationStatus.pathLength.value).toBeWithinRange(53, 0.5);
        expect(verificationStatus.routeType.valid).toEqual(true);
        expect(verificationStatus.routeType.value).toEqual(0);
        expect(verificationStatus.numberOfStations.valid).toEqual(true);
        expect(verificationStatus.stationsOrder.valid).toEqual(false);
        expect(verificationStatus.stationsOnPath.valid).toEqual(true);
        expect(verificationStatus.elevationGain.value).toBeWithinRange(410, 100);
        expect(verificationStatus.elevationLoss.value).toBeWithinRange(410, 100);
        expect(verificationStatus.elevationTotalChange.value).toBeWithinRange(820, 100);
    });

    test('Stations in reversed order comparing to path direction', async () => {
        const { verificationStatus } = await getVerificationOutputFor('reversed_path');
        expect(verificationStatus.singlePath.valid).toEqual(true);
        expect(verificationStatus.pathLength.valid).toEqual(true);
        expect(verificationStatus.pathLength.value).toBeWithinRange(44, 0.5);
        expect(verificationStatus.routeType.valid).toEqual(true);
        expect(verificationStatus.routeType.value).toEqual(0);
        expect(verificationStatus.numberOfStations.valid).toEqual(true);
        expect(verificationStatus.stationsOrder.valid).toEqual(false);
        expect(verificationStatus.stationsOnPath.valid).toEqual(true);
        expect(verificationStatus.elevationGain.value).toBeWithinRange(920, 100);
        expect(verificationStatus.elevationLoss.value).toBeWithinRange(880, 100);
        expect(verificationStatus.elevationTotalChange.value).toBeWithinRange(1800, 100);
    });

    test('Path too short (less than 30km)', async () => {
        const { verificationStatus } = await getVerificationOutputFor('too_short_path');
        expect(verificationStatus.singlePath.valid).toEqual(true);
        expect(verificationStatus.pathLength.valid).toEqual(false);
        expect(verificationStatus.pathLength.value).toBeWithinRange(25, 0.5);
        expect(verificationStatus.routeType.valid).toEqual(false);
        expect(verificationStatus.routeType.value).toEqual(2);
        expect(verificationStatus.numberOfStations.valid).toEqual(true);
        expect(verificationStatus.stationsOrder.valid).toEqual(true);
        expect(verificationStatus.stationsOnPath.valid).toEqual(true);
        expect(verificationStatus.elevationGain.value).toBeWithinRange(425, 100);
        expect(verificationStatus.elevationLoss.value).toBeWithinRange(427, 100);
        expect(verificationStatus.elevationTotalChange.value).toBeWithinRange(850, 100);
    });
});
