import logger from 'loglevel';
import * as _ from './lodash';

// Constants
const ROUTE_TYPE_ID = 'div#routeType';
const SINGLE_PATH_ID = 'div#singlePath';
const PATH_LENGTH_ID = 'div#pathLength';
const ELEVATION_GAIN_ID = 'div#elevationGain';
const ELEVATION_LOSS_ID = 'div#elevationLoss';
const ELEVATION_TOTAL_CHANGE_ID = 'div#elevationTotalChange';
const NUMBER_OF_STATIONS_ID = 'div#numberOfStations';
const STATIONS_ORDER_ID = 'div#stationsOrder';
const STATIONS_ON_PATH_ID = 'div#stationsOnPath';
const DATA_CONSISTENCY_ID = 'div#dataConsistency';
const ELEVATION_CHART_ID = 'canvas#elevationChart';
const VERIFY_BUTTON_ID = 'button#verifyRoute';
const LOADER_ID = 'div#loader';
const LOADER_ELEMENT = '<div id="loader" class="overlay"><i class="fa fa-refresh fa-spin"></i></div>';
const ELEVATION_CHART_ELEMENT = '<canvas id="elevationChart"></canvas>';


const updateControlColor = function (element, isValid) {
    const VALID_COLOR_CLASS = 'bg-green';
    const INVALID_COLOR_CLASS = 'bg-yellow';
    const INFO_BOX_ICON = 'span.info-box-icon';

    if (_.isNull(isValid)) {
        $(element + ' ' + INFO_BOX_ICON).removeClass([INVALID_COLOR_CLASS, VALID_COLOR_CLASS].join(' '))
    } else {
        isValid
            ? $(element + ' ' + INFO_BOX_ICON).removeClass(INVALID_COLOR_CLASS).addClass(VALID_COLOR_CLASS)
            : $(element + ' ' + INFO_BOX_ICON).removeClass(VALID_COLOR_CLASS).addClass(INVALID_COLOR_CLASS);
    }
}

const updateControlValue = function (element, value, unit) {
    const INFO_BOX_NUMBER = 'span.info-box-number';

    logger.debug('Updating control element', element, 'with:', value, unit);
    $(element + ' ' + INFO_BOX_NUMBER).html(value + ' ' + (unit ? '<small>'+unit+'</small>' : ''));
}

const removeControlChildren = function(element) {
    $(ELEVATION_CHART_ID).empty();
}




export default class Controls {
    // Constructor


    updateRouteType (isNormalRoute) {
        const normalRouteString = $('input#normalRouteString').attr('value');
        const inspiredRouteString = $('input#inspiredRouteString').attr('value');
        updateControlValue(ROUTE_TYPE_ID, isNormalRoute ? normalRouteString : inspiredRouteString);
    }

    updatePathLength (isLengthValid, length) {
        updateControlValue(PATH_LENGTH_ID, length.toFixed(2), 'km');
        updateControlColor(PATH_LENGTH_ID, isLengthValid);
    }

    updateElevationGain (isElevationGainValid, elevationGain) {
        updateControlValue(ELEVATION_GAIN_ID, elevationGain.toFixed(2), 'm')
        updateControlColor(ELEVATION_GAIN_ID, isElevationGainValid);
    }

    updateElevationLoss (isElevationLossValid, elevationLoss) {
        updateControlValue(ELEVATION_LOSS_ID, elevationLoss.toFixed(2), 'm')
        updateControlColor(ELEVATION_LOSS_ID, isElevationLossValid);
    }

    updateElevationTotalChange (isElevationTotalChangeValid, elevationTotalChange) {
        updateControlValue(ELEVATION_TOTAL_CHANGE_ID, elevationTotalChange.toFixed(2), 'm');
        updateControlColor(ELEVATION_TOTAL_CHANGE_ID, isElevationTotalChangeValid);
    }

    updateNumberOfStations (areAllStationsPresent) {
        updateControlColor(NUMBER_OF_STATIONS_ID, areAllStationsPresent);
    }

    updateStationsOrder (isStationOrderCorrect) {
        updateControlColor(STATIONS_ORDER_ID, isStationOrderCorrect);
    }

    updateStationsOnPath (areAllStationsOnPath) {
        updateControlColor(STATIONS_ON_PATH_ID, areAllStationsOnPath);
    }

    updateSinglePath (isSinglePath) {
        updateControlColor(SINGLE_PATH_ID, isSinglePath);
    }

    updateDataConsistency (isDataConsistent) {
        updateControlColor(DATA_CONSISTENCY_ID, isDataConsistent);
    }

     drawElevationChart (pathElevation) {
        const X_AXIS_NUMBER_OF_LABELS = 10;
        const X_AXIS_LABEL_STRING = '[km]';
        const Y_AXIS_LABEL_STRING = '[m]';
        const CHART_BACKGROUND_COLOR = 'rgb(32, 77, 116)';

        const labelWidth = parseInt(pathElevation.data.length / X_AXIS_NUMBER_OF_LABELS);
        const labels = _.map(pathElevation.data, function(elevation) { return elevation.distance.toFixed(); });
        const data = _.map(pathElevation.data, function(elevation) { return elevation.elevation; }) ;

        logger.debug('Drawing elevation chart. Input:', pathElevation);

        const elevationChart = new Chart($(ELEVATION_CHART_ID), {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: '',
                    data,
                    fill: 'start',
                    radius: 0,
                    backgroundColor: CHART_BACKGROUND_COLOR
                }]
            },
            options: {
                scales: {
                    xAxes: [{
                        scaleLabel: {
                            display: true,
                            labelString: X_AXIS_LABEL_STRING
                        },
                        ticks: {
                            callback: (dataLabel, index) => {
                                return (index % labelWidth === 0) || (index === pathElevation.data.length-1) ? dataLabel : null;
                            }
                        }
                    }],
                    yAxes: [{
                        scaleLabel: {
                            display: true,
                            labelString: Y_AXIS_LABEL_STRING
                        },
                    }]
                },
                legend: {
                    display: false,
                },
                tooltips: {
                    enabled: false
                }
            }
        });
    }

    resetElevationChart () {
        const elevationChartParentElement = $(ELEVATION_CHART_ID).parent();
        $(ELEVATION_CHART_ID).remove();
        elevationChartParentElement.append(ELEVATION_CHART_ELEMENT);
    }

    addLoaderToButton () {
        $(VERIFY_BUTTON_ID).append(LOADER_ELEMENT);
    }

    removeLoaderFromButton () {
        $(VERIFY_BUTTON_ID + ' ' + LOADER_ID).remove();
    }

    resetAll (value) {
        const text = '';
        const isValid = value === undefined ? null : value;

        updateControlValue(ROUTE_TYPE_ID, text);
        updateControlValue(PATH_LENGTH_ID, text);
        updateControlColor(PATH_LENGTH_ID, isValid);
        updateControlValue(ELEVATION_GAIN_ID, text)
        updateControlColor(ELEVATION_GAIN_ID, isValid);
        updateControlValue(ELEVATION_LOSS_ID, text)
        updateControlColor(ELEVATION_LOSS_ID, isValid);
        updateControlValue(ELEVATION_TOTAL_CHANGE_ID, text);
        updateControlColor(ELEVATION_TOTAL_CHANGE_ID, isValid);
        updateControlColor(NUMBER_OF_STATIONS_ID, isValid);
        updateControlColor(STATIONS_ORDER_ID, isValid);
        updateControlColor(STATIONS_ON_PATH_ID, isValid);
        updateControlColor(SINGLE_PATH_ID, isValid);
        updateControlColor(DATA_CONSISTENCY_ID, isValid);
        this.resetElevationChart();
    }

}

