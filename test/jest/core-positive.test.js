import { initializeVerificationEnvironment, getVerificationOutputFor } from './common';

describe('Route verification - positive', () => {
    beforeAll(() => {
        initializeVerificationEnvironment();
    });

    test('Regular path', async () => {
        const { verificationStatus } = await getVerificationOutputFor('regular');

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
    });

    // FIXME: Change to negative or update position
    test('Zero-leading station numbers', async () => {
        const { verificationStatus } = await getVerificationOutputFor('zero_leading');
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
    });

    test('Circular path #1', async () => {
        const { verificationStatus } = await getVerificationOutputFor('circular_path_1');
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
    });

    test('Circular path #2', async () => {
        const { verificationStatus } = await getVerificationOutputFor('circular_path_2');
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
    });

    test('Circular path #3', async () => {
        const { verificationStatus } = await getVerificationOutputFor('circular_path_3');
        expect(verificationStatus.singlePath.valid).toEqual(true);
        expect(verificationStatus.pathLength.value).toBeWithinRange(42, 0.5);
        expect(verificationStatus.routeType.valid).toEqual(true);
        expect(verificationStatus.routeType.value).toEqual(0);
        expect(verificationStatus.numberOfStations.valid).toEqual(true);
        expect(verificationStatus.stationsOrder.valid).toEqual(true);
        expect(verificationStatus.stationsOnPath.valid).toEqual(true);
        expect(verificationStatus.elevationGain.value).toBeWithinRange(300, 50);
        expect(verificationStatus.elevationLoss.value).toBeWithinRange(300, 50);
        expect(verificationStatus.elevationTotalChange.value).toBeWithinRange(600, 50);
    });

    // FIXME: Currently it is positive, unrecognized points are not counted as stations
    test('15 stations', async () => {
        const { verificationStatus } = await getVerificationOutputFor('15_stations');
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
    });

    test('Short distance between station 1 and 14', async () => {
        const { verificationStatus } = await getVerificationOutputFor('short_distance_between_1_14');
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
    });

    test('Eight-shaped route', async () => {
        const { verificationStatus } = await getVerificationOutputFor('eight_shaped_route');
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
    });
});
