module.exports = {

    before : function(client) {

    },

    'Positive test - regular path': function (client) {
        client.page.page()
            .navigateToRoute('01-regular')
            .verifyRoute()
            .closeVerificationSucceededModal()
            .assertSinglePath(true)
            .assertPathLength(52, 1)
            .assertRouteType('Trasa EDK')
            .assertNumberOfStations(true)
            .assertStationsOrder(true)
            .assertStationsOnPath(true)
            .assertElevationGain(350, 50)
            .assertElevationLoss(390, 50)
            .assertElevationTotalChange(750, 50)
            .assertDataConsistency(true);
    },

    'Positive test - circular route': function (client) {
        client.page.page()
            .navigateToRoute('02-circular')
            .verifyRoute()
            .closeVerificationSucceededModal()
            .assertSinglePath(true)
            .assertPathLength(37, 1)
            .assertRouteType('Trasa EDK')
            .assertNumberOfStations(true)
            .assertStationsOrder(true)
            .assertStationsOnPath(true)
            .assertElevationGain(1580, 50)
            .assertElevationLoss(1580, 50)
            .assertElevationTotalChange(3160, 50)
            .assertDataConsistency(true);
    },

    // TODO: Change to negative or update position
    'Positive test - zero-leading station numbers': function (client) {
        client.page.page()
            .navigateToRoute('03-zero_leading')
            .verifyRoute()
            .closeVerificationFailedModal()
            .assertSinglePath(true)
            .assertPathLength(76, 1)
            .assertRouteType('Trasa EDK')
            .assertNumberOfStations(true)
            .assertStationsOrder(true)
            .assertStationsOnPath(false)
            .assertElevationGain(1610, 100)
            .assertElevationLoss(1380, 100)
            .assertElevationTotalChange(3000, 100)
            .assertDataConsistency(true);
    },

    'Positive test - route with shared parts #1': function (client) {
        client.page.page()
            .navigateToRoute('04-shared_parts')
            .verifyRoute()
            .closeVerificationSucceededModal()
            .assertSinglePath(true)
            .assertPathLength(49, 1)
            .assertRouteType('Trasa EDK')
            .assertNumberOfStations(true)
            .assertStationsOrder(true)
            .assertStationsOnPath(true)
            .assertElevationGain(390, 100)
            .assertElevationLoss(395, 100)
            .assertElevationTotalChange(785, 100)
            .assertDataConsistency(true);
    },

    'Positive test - route with shared parts #2': function (client) {
        client.page.page()
            .navigateToRoute('05-shared_parts')
            .verifyRoute()
            .closeVerificationSucceededModal()
            .assertSinglePath(true)
            .assertPathLength(53, 1)
            .assertRouteType('Trasa EDK')
            .assertNumberOfStations(true)
            .assertStationsOrder(true)
            .assertStationsOnPath(true)
            .assertElevationGain(410, 100)
            .assertElevationLoss(410, 100)
            .assertElevationTotalChange(820, 100)
            .assertDataConsistency(true);
    },

    'Positive test - stations in reversed order comparing to path direction': function (client) {
        client.page.page()
            .navigateToRoute('06-reversed_path')
            .verifyRoute()
            .closeVerificationSucceededModal()
            .assertSinglePath(true)
            .assertPathLength(44, 1)
            .assertRouteType('Trasa EDK')
            .assertNumberOfStations(true)
            .assertStationsOrder(true)
            .assertStationsOnPath(true)
            .assertElevationGain(920, 100)
            .assertElevationLoss(880, 100)
            .assertElevationTotalChange(1800, 100)
            .assertDataConsistency(true);
    },

    'Positive test - long path': function (client) {
    },

    'Negative test - duplicated station point': function (client) {
        client.page.page()
            .navigateToRoute('10-duplicated_station_point')
            .verifyRoute()
            .closeVerificationFailedModal()
            .assertSinglePath(true)
            .assertPathLength(29, 1)
            .assertRouteType('Droga na wzór EDK')
            .assertNumberOfStations(false)
            .assertStationsOrder(false)
            .assertStationsOnPath(true)
            .assertElevationGain(190, 50)
            .assertElevationLoss(145, 50)
            .assertElevationTotalChange(335, 50)
            .assertDataConsistency(true);
    },


    'Negative test - station out of path': function (client) {
        client.page.page()
            .navigateToRoute('11-station_out_of_path')
            .verifyRoute()
            .closeVerificationFailedModal()
            .assertSinglePath(true)
            .assertPathLength(44, 1)
            .assertRouteType('Trasa EDK')
            .assertNumberOfStations(true)
            .assertStationsOrder(true)
            .assertStationsOnPath(false)
            .assertElevationGain(320, 50)
            .assertElevationLoss(380, 50)
            .assertElevationTotalChange(700, 50)
            .assertDataConsistency(true);
    },


    'Positive test - circular path': function (client) {
        client.page.page()
            .navigateToRoute('12-circular_path')
            .verifyRoute()
            .closeVerificationSucceededModal()
            .assertSinglePath(true)
            .assertPathLength(37, 1)
            .assertRouteType('Trasa EDK')
            .assertNumberOfStations(true)
            .assertStationsOrder(true)
            .assertStationsOnPath(true)
            .assertElevationGain(1600, 100)
            .assertElevationLoss(1600, 100)
            .assertElevationTotalChange(3200, 100)
            .assertDataConsistency(true);
    },

    'Negative test - one path and no stations': function (client) {
        client.page.page()
            .navigateToRoute('14-one_path_no_stations')
            .verifyRoute()
            .closeVerificationFailedModal()
            .assertSinglePath(true)
            .assertPathLength(44, 1)
            .assertRouteType('Trasa EDK')
            .assertNumberOfStations(false)
            .assertStationsOrder(true)
            .assertStationsOnPath(true)
            .assertElevationGain(220, 100)
            .assertElevationLoss(200, 100)
            .assertElevationTotalChange(420, 100)
            .assertDataConsistency(true);
    },

    'Negative test - no lineString tag in KML file': function (client) {
        client.page.page()
            .navigateToRoute('15_no_path')
            .verifyRoute()
            .closeVerificationFailedModal()
            .assertSinglePath(false)
            .assertNumberOfStations(false)
            .assertStationsOrder(false)
            .assertStationsOnPath(false)
            .assertDataConsistency(false);
    },

	 'Negative test - 20-duplicated path': function (client) {
        client.page.page()
            .navigateToRoute('20-duplicated_path')
            .verifyRoute()
            .closeVerificationFailedModal()
            .assertSinglePath(false)
            .assertPathLength(52, 1)
            .assertRouteType('Trasa EDK')
            .assertNumberOfStations(true)
            .assertStationsOrder(true)
            .assertStationsOnPath(true)
            .assertElevationGain(350, 50)
            .assertElevationLoss(390, 50)
            .assertElevationTotalChange(740, 50)
            .assertDataConsistency(true);
    },
	
	 'Negative test - 21-two path': function (client) {
        client.page.page()
            .navigateToRoute('21-two_path')
            .verifyRoute()
            .closeVerificationFailedModal()
            .assertSinglePath(false)
            .assertPathLength(24, 1)
            .assertRouteType('Droga na wzór EDK')
            .assertNumberOfStations(true)
            .assertStationsOrder(true)
            .assertStationsOnPath(false)
            .assertElevationGain(250, 50)
            .assertElevationLoss(260, 50)
            .assertElevationTotalChange(520, 50)
            .assertDataConsistency(false);
    },

	 'Negative test - 22-15_stations': function (client) { // Currently it is positive, unrecognized points are not counted as stations
        client.page.page()
            .navigateToRoute('22-15_stations')
            .verifyRoute()
            .closeVerificationSucceededModal()
            .assertSinglePath(true)
            .assertPathLength(40, 1)
            .assertRouteType('Trasa EDK')
            .assertNumberOfStations(true)
            .assertStationsOrder(true)
            .assertStationsOnPath(true)
            .assertElevationGain(313, 50)
            .assertElevationLoss(314, 50)
            .assertElevationTotalChange(627, 50)
            .assertDataConsistency(true);
    },
	 'Negative test - 23-13_stations': function (client) {
        client.page.page()
            .navigateToRoute('23-13_stations')
            .verifyRoute()
            .closeVerificationFailedModal()
            .assertSinglePath(true)
            .assertPathLength(40, 1)
            .assertRouteType('Trasa EDK')
            .assertNumberOfStations(false)
            .assertStationsOrder(true)
            .assertStationsOnPath(true)
            .assertElevationGain(313, 50)
            .assertElevationLoss(314, 50)
            .assertElevationTotalChange(627, 50)
            .assertDataConsistency(true);
    },

	 'Positive test - 24-Short_distance_between_1_14': function (client) {
        client.page.page()
            .navigateToRoute('24-Short_distance_between_1_14')
            .verifyRoute()
            .closeVerificationSucceededModal()
            .assertSinglePath(true)
            .assertPathLength(40, 1)
            .assertRouteType('Trasa EDK')
            .assertNumberOfStations(true)
            .assertStationsOrder(true)
            .assertStationsOnPath(true)
            .assertElevationGain(327, 50)
            .assertElevationLoss(328, 50)
            .assertElevationTotalChange(650, 50)
            .assertDataConsistency(true);
    },
	
	 'Positive test - 25-eight_shaped_route': function (client) {
        client.page.page()
            .navigateToRoute('25-eight_shaped_route')
            .verifyRoute()
            .closeVerificationSucceededModal()
            .assertSinglePath(true)
            .assertPathLength(52, 1)
            .assertRouteType('Trasa EDK')
            .assertNumberOfStations(true)
            .assertStationsOrder(true)
            .assertStationsOnPath(true)
            .assertElevationGain(385, 50)
            .assertElevationLoss(385, 50)
            .assertElevationTotalChange(750, 50)
            .assertDataConsistency(true);
    },


    after: function(client) {
        client.end();
    }
};
