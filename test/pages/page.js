let _ = require('lodash');

module.exports = {
    props: {
        successClass: 'bg-green'
    },

    commands: [
        {
            navigateToRoute: function(routeId) {
                this.api
                    .url(`${this.api.launchUrl}/${routeId}`)
                    .waitForElementVisible('body')
                    .pause(2000); // FIXME: Wait for JS/CSS loaded instead of using pause

                return this;
            },
            verifyRoute: function() {
                this.waitForElementNotPresent('@verifyRouteButtonLoader')
                    .click('@verifyRouteButton')
                    .waitForElementNotPresent('@verifyRouteButtonLoader')
                    .api.pause(1000); // FIXME: Find another way

                return this;
            },
            closeVerificationSucceededModal: function() {
                this.waitForElementVisible('@pageReloadModal')
                    .waitForElementVisible('@pageReloadModalCloseIcon')
                    .click('@pageReloadModalCloseIcon')
                    .waitForElementNotVisible('@pageReloadModal');

                return this;
            },
            closeVerificationFailedModal: function() {
                this.waitForElementVisible('@verificationFailedModal')
                    .waitForElementVisible('@verificationFailedModalCloseIcon')
                    .click('@verificationFailedModalCloseIcon')
                    .waitForElementNotVisible('@verificationFailedModal');

                return this;
            },
            assertSinglePath: function(isSingle) {
                this.log('Single path verification. Expecting path:', isSingle ? 'single' : 'not single');
                return isSingle
                    ? this.assert.cssClassPresent(this.elements.singlePathIcon.selector, this.props.successClass)
                    : this.assert.cssClassNotPresent(this.elements.singlePathIcon.selector, this.props.successClass);
            },
            assertPathLength: function(expectedPathLength, acceptedDifference) {
                return this
                    .log(`Path length verification. Expecting path length: ${expectedPathLength}km +/- ${acceptedDifference}km`)
                    .getText(this.elements.pathLengthNumber.selector, function(result) {
                        let actualPathLength = parseFloat(result.value);
                        return this.assert.ok(actualPathLength - acceptedDifference < expectedPathLength &&
                                              expectedPathLength < actualPathLength + acceptedDifference,
                                              `Actual path length: ${actualPathLength}`);
                    })
            },
            assertRouteType: function(expectedRouteType) {
                return this
                    .log(`Route type verification. Expecting route type: ${expectedRouteType}`)
                    .getText(this.elements.routeTypeText.selector, function(result) {
                        let actualRouteType = _.trim(result.value);
                        return this.assert.equal(actualRouteType, expectedRouteType,
                                                 `Actual route type: ${actualRouteType}`);
                    })
            },
            assertNumberOfStations: function(isOK) {
                this.log('Number of stations verification. Expecting:', isOK ? 'OK' : 'FAIL');
                return isOK
                    ? this.assert.cssClassPresent(this.elements.numberOfStationsIcon.selector, this.props.successClass)
                    : this.assert.cssClassNotPresent(this.elements.numberOfStationsIcon.selector, this.props.successClass);
            },
            assertStationsOrder: function(isOK) {
                this.log('Stations order verification. Expecting:', isOK ? 'OK' : 'FAIL');
                return isOK
                    ? this.assert.cssClassPresent(this.elements.stationsOrderIcon.selector, this.props.successClass)
                    : this.assert.cssClassNotPresent(this.elements.stationsOrderIcon.selector, this.props.successClass);
            },
            assertStationsOnPath: function(isOK) {
                this.log('Stations on path verification. Expecting:', isOK ? 'OK' : 'FAIL');
                return isOK
                    ? this.assert.cssClassPresent(this.elements.stationsOnPathIcon.selector, this.props.successClass)
                    : this.assert.cssClassNotPresent(this.elements.stationsOnPathIcon.selector, this.props.successClass);
            },
            assertElevationGain: function(expectedElevationGain, acceptedDifference) {
                return this
                    .log(`Elevation gain verification. Expecting: ${expectedElevationGain}m +/- ${acceptedDifference}m`)
                    .getText(this.elements.elevationGainNumber.selector, function(result) {
                        let actualElevationGain = parseFloat(result.value);
                        return this.assert.ok(actualElevationGain - acceptedDifference < expectedElevationGain &&
                            expectedElevationGain < actualElevationGain + acceptedDifference,
                            `Actual elevation gain: ${actualElevationGain}`);
                    })
            },
            assertElevationLoss: function(expectedElevationLoss, acceptedDifference) {
                return this
                    .log(`Elevation loss verification. Expecting: ${expectedElevationLoss}m +/- ${acceptedDifference}m`)
                    .getText(this.elements.elevationLossNumber.selector, function(result) {
                        let actualElevationLoss = parseFloat(result.value);
                        return this.assert.ok(actualElevationLoss - acceptedDifference < expectedElevationLoss &&
                            expectedElevationLoss < actualElevationLoss + acceptedDifference,
                            `Actual elevation loss: ${actualElevationLoss}`);
                    })
            },
            assertElevationTotalChange: function(expectedElevationTotalChange, acceptedDifference) {
                return this
                    .log(`Elevation total change verification. Expecting: ${expectedElevationTotalChange}m +/- ${acceptedDifference}m`)
                    .getText(this.elements.elevationTotalChangeNumber.selector, function(result) {
                        let actualElevationTotalChange = parseFloat(result.value);
                        return this.assert.ok(actualElevationTotalChange - acceptedDifference < expectedElevationTotalChange &&
                            expectedElevationTotalChange < actualElevationTotalChange + acceptedDifference,
                            `Actual elevation total change: ${actualElevationTotalChange}`);
                    })
            },
            assertDataConsistency: function(isOK) {
                this.log('Data consistency verification. Expecting:', isOK ? 'OK' : 'FAIL');
                return isOK
                    ? this.assert.cssClassPresent(this.elements.dataConsistencyIcon.selector, this.props.successClass)
                    : this.assert.cssClassNotPresent(this.elements.dataConsistencyIcon.selector, this.props.successClass);
            },
        },
    ],

    elements: {
        verifyRouteButton: 'button#verifyRoute',
        verifyRouteButtonLoader: 'button#verifyRoute div#loader',

        pageReloadModal: 'div#pageReloadModal',
        pageReloadModalCloseIcon: 'div#pageReloadModal button.close',

        verificationFailedModal: 'div#verificationFailedModal',
        verificationFailedModalCloseIcon: 'div#verificationFailedModal button.close',

        singlePathBox: 'div#singlePath',
        singlePathIcon: 'div#singlePath span.info-box-icon',

        pathLengthBox: 'div#pathLength',
        pathLengthIcon: 'div#pathLength span.info-box-icon',
        pathLengthNumber: 'div#pathLength div.info-box-content span.info-box-number',

        routeTypeBox: 'div#routeType',
        routeTypeIcon: 'div#routeType span.info-box-icon',
        routeTypeText: 'div#routeType div.info-box-content span.info-box-number',

        numberOfStationsBox: 'div#numberOfStations',
        numberOfStationsIcon: 'div#numberOfStations span.info-box-icon',

        stationsOrderBox: 'div#stationsOrder',
        stationsOrderIcon: 'div#stationsOrder span.info-box-icon',

        stationsOnPathBox: 'div#stationsOnPath',
        stationsOnPathIcon: 'div#stationsOnPath span.info-box-icon',

        elevationGainBox: 'div#elevationGain',
        elevationGainIcon: 'div#elevationGain span.info-box-icon',
        elevationGainNumber: 'div#elevationGain div.info-box-content span.info-box-number',

        elevationLossBox: 'div#elevationLoss',
        elevationLossIcon: 'div#elevationLoss span.info-box-icon',
        elevationLossNumber: 'div#elevationLoss div.info-box-content span.info-box-number',

        elevationTotalChangeBox: 'div#elevationTotalChange',
        elevationTotalChangeIcon: 'div#elevationTotalChange span.info-box-icon',
        elevationTotalChangeNumber: 'div#elevationTotalChange div.info-box-content span.info-box-number',

        dataConsistencyBox: 'div#dataConsistency',
        dataConsistencyIcon: 'div#dataConsistency span.info-box-icon',

    }
};
