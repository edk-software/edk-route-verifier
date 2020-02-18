import { getVerificationOutputFor, initializeVerificationEnvironment } from './common';

describe('Route verification - negative', () => {
    beforeAll(() => {
        initializeVerificationEnvironment();
    });

    test('Duplicated station point', async () => {
        const { verificationStatus } = await getVerificationOutputFor('10-duplicated_station_point');
        expect(verificationStatus.singlePath.valid).toEqual(true);
        expect(verificationStatus.pathLength.value).toBeWithinRange(29, 0.5);
        expect(verificationStatus.routeType.valid).toEqual(false);
        expect(verificationStatus.routeType.value).toEqual(1);
        expect(verificationStatus.numberOfStations.valid).toEqual(false);
        expect(verificationStatus.stationsOrder.valid).toEqual(false);
        expect(verificationStatus.stationsOnPath.valid).toEqual(true);
        expect(verificationStatus.elevationGain.value).toBeWithinRange(190, 50);
        expect(verificationStatus.elevationLoss.value).toBeWithinRange(145, 50);
        expect(verificationStatus.elevationTotalChange.value).toBeWithinRange(335, 50);
    });

    test('Station out of path', async () => {
        const { verificationStatus } = await getVerificationOutputFor('11-station_out_of_path');
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
    });

    test('One path and no stations', async () => {
        const { verificationStatus } = await getVerificationOutputFor('14-one_path_no_stations');
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
    });

    test('Duplicated path', async () => {
        const { verificationStatus } = await getVerificationOutputFor('20-duplicated_path');
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
    });

    test('Two paths', async () => {
        const { verificationStatus } = await getVerificationOutputFor('21-two_path');
        expect(verificationStatus.singlePath.valid).toEqual(false);
        expect(verificationStatus.pathLength.value).toBeWithinRange(24, 1);
        expect(verificationStatus.routeType.valid).toEqual(false);
        expect(verificationStatus.routeType.value).toEqual(1);
        expect(verificationStatus.numberOfStations.valid).toEqual(true);
        expect(verificationStatus.stationsOrder.valid).toEqual(true);
        expect(verificationStatus.stationsOnPath.valid).toEqual(false);
        expect(verificationStatus.elevationGain.value).toBeWithinRange(250, 50);
        expect(verificationStatus.elevationLoss.value).toBeWithinRange(260, 50);
        expect(verificationStatus.elevationTotalChange.value).toBeWithinRange(520, 50);
    });

    test('13 stations', async () => {
        const { verificationStatus } = await getVerificationOutputFor('23-13_stations');
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
    });

    test('two paths (big file test)', async () => {
        const { verificationStatus } = await getVerificationOutputFor('26-big_file');
        expect(verificationStatus.singlePath.valid).toEqual(false);
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
});
