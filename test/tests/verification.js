module.exports = {

    before : function(client) {

    },

    'Positive test - short path': function (client) {
        client.page.page()
            .navigate(1)
            .verifyRoute()
            .closePageReloadModal()
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
            .navigate('2-circular')
            .verifyRoute()
            .closePageReloadModal()
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

    'Positive test - zero-leading station numbers': function (client) {
        client.page.page()
            .navigate('3-zero_leading')
            .verifyRoute()
            .assertSinglePath(true)
            .assertPathLength(80, 1)
            .assertRouteType('Trasa EDK')
            .assertNumberOfStations(true)
            .assertStationsOrder(true)
            .assertStationsOnPath(false)
            .assertElevationGain(1675, 100)
            .assertElevationLoss(1425, 100)
            .assertElevationTotalChange(3100, 100)
            .assertDataConsistency(true);
    },

    'Positive test - long path': function (client) {
    },

    'Negative test - duplicated station point': function (client) {
        client.page.page()
            .navigate('10-duplicated_station_point')
            .verifyRoute()
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
            .navigate('11-station_out_of_path')
            .verifyRoute()
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
            .navigate('12-circular_path')
            .verifyRoute()
            .closePageReloadModal()
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

    'Negative test - stations in reversed order comparing to path direction': function (client) {
        client.page.page()
            .navigate('13-reversed_path')
            .verifyRoute()
            .assertSinglePath(true)
            .assertPathLength(46, 1)
            .assertRouteType('Trasa EDK')
            .assertNumberOfStations(true)
            .assertStationsOrder(false)
            .assertStationsOnPath(true)
            .assertElevationGain(920, 100)
            .assertElevationLoss(880, 100)
            .assertElevationTotalChange(1800, 100)
            .assertDataConsistency(true);
    },

	 'Negative test - 20-duplicated path': function (client) {
        client.page.page()
            .navigate('20-duplicated_path')
            .verifyRoute()
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
            .navigate('21-two_path')
            .verifyRoute()
            .assertSinglePath(false)
            .assertPathLength(24, 1)
            .assertRouteType('Droga na wzór EDK')
            .assertNumberOfStations(true)
            .assertStationsOrder(false)
            .assertStationsOnPath(false)
            .assertElevationGain(250, 50)
            .assertElevationLoss(260, 50)
            .assertElevationTotalChange(520, 50)
            .assertDataConsistency(false);
    },

	 'Negative test - 22-15_stations': function (client) { // Currently it is positive, unrecognized points are not counted as stations
        client.page.page()
            .navigate('22-15_stations')
            .verifyRoute()
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
            .navigate('23-13_stations')
            .verifyRoute()
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
            .navigate('24-Short_distance_between_1_14')
            .verifyRoute()
            .closePageReloadModal()
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
            .navigate('25-eight_shaped_route')
            .verifyRoute()
            .closePageReloadModal()
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

    'Negative test - no lineString tag in KML file': function (client) {
        client.page.page()
            .navigate('no_lineString')
            .verifyRoute()
            .assertSinglePath(false)
            .assertNumberOfStations(false)
            .assertStationsOrder(false)
            .assertStationsOnPath(false)
            .assertDataConsistency(false);
    },

    'Negative test - no points in KML file': function (client) {
        client.page.page()
            .navigate('no_points')
            .verifyRoute()
            .assertSinglePath(false)
            .assertNumberOfStations(false)
            .assertStationsOrder(false)
            .assertStationsOnPath(false)
            .assertDataConsistency(false);
    },

    after: function(client) {
        client.end();
    }
};
