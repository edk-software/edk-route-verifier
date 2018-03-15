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
            .assertElevationGain(300, 20)
            .assertElevationLoss(340, 20)
            .assertElevationTotalChange(650, 20)
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
            .assertElevationGain(1580, 20)
            .assertElevationLoss(1580, 20)
            .assertElevationTotalChange(3160, 20)
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
            .assertElevationGain(1600, 20)
            .assertElevationLoss(1360, 20)
            .assertElevationTotalChange(2970, 20)
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
            .assertElevationGain(190, 20)
            .assertElevationLoss(145, 20)
            .assertElevationTotalChange(335, 20)
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
            .assertElevationGain(220, 20)
            .assertElevationLoss(270, 20)
            .assertElevationTotalChange(490, 20)
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
            .assertElevationGain(1600, 20)
            .assertElevationLoss(1600, 20)
            .assertElevationTotalChange(3200, 40)
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
            .assertElevationGain(920, 20)
            .assertElevationLoss(880, 20)
            .assertElevationTotalChange(1800, 40)
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
            .assertElevationGain(304, 20)
            .assertElevationLoss(342, 20)
            .assertElevationTotalChange(646, 40)
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
            .assertElevationGain(157, 20)
            .assertElevationLoss(163, 20)
            .assertElevationTotalChange(320, 40)
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
            .assertElevationGain(313, 20)
            .assertElevationLoss(314, 20)
            .assertElevationTotalChange(627, 40)
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
            .assertElevationGain(313, 20)
            .assertElevationLoss(314, 20)
            .assertElevationTotalChange(627, 40)
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
            .assertElevationGain(327, 20)
            .assertElevationLoss(328, 20)
            .assertElevationTotalChange(650, 40)
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
            .assertElevationGain(285, 20)
            .assertElevationLoss(285, 20)
            .assertElevationTotalChange(570, 40)
            .assertDataConsistency(true);
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
