import logger from 'loglevel';
import Chart from 'chart.js';

import * as _ from '../core/utils/lodash.js';
import AbstractOutputAdapter from '../data/AbstractOutputAdapter.js';

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
const SUCCESS_VERIFICATION_MODAL_ID = 'div#pageReloadModal';
const FAILED_VERIFICATION_MODAL_ID = 'div#verificationFailedModal';
const FAILED_VERIFICATION_MODAL_BODY = `${FAILED_VERIFICATION_MODAL_ID} div.modal-body`;

export default class BrowserAdapter extends AbstractOutputAdapter {
    constructor() {
        super();

        this.updateControlColor = (element, isValid) => {
            const VALID_COLOR_CLASS = 'bg-green';
            const INVALID_COLOR_CLASS = 'bg-yellow';
            const INFO_BOX_ICON = 'span.info-box-icon';

            if (_.isNull(isValid)) {
                $(`${element} ${INFO_BOX_ICON}`).removeClass([INVALID_COLOR_CLASS, VALID_COLOR_CLASS].join(' '));
            } else if (isValid) {
                $(`${element} ${INFO_BOX_ICON}`)
                    .removeClass(INVALID_COLOR_CLASS)
                    .addClass(VALID_COLOR_CLASS);
            } else {
                $(`${element} ${INFO_BOX_ICON}`)
                    .removeClass(VALID_COLOR_CLASS)
                    .addClass(INVALID_COLOR_CLASS);
            }
        };

        this.updateControlValue = (element, value, unit) => {
            const INFO_BOX_NUMBER = 'span.info-box-number';

            logger.debug('Updating control element', element, 'with:', value, unit);
            $(`${element} ${INFO_BOX_NUMBER}`).html(`${value} ${unit ? `<small>${unit}</small>` : ''}`);
        };
    }

    updateRouteType(isRouteTypeValid, routeType) {
        const normalRouteString = $('input#normalRouteString').attr('value');
        const inspiredRouteString = $('input#inspiredRouteString').attr('value');

        if (routeType === 0) {
            this.updateControlValue(ROUTE_TYPE_ID, normalRouteString);
        } else if (routeType === 1) {
            this.updateControlValue(ROUTE_TYPE_ID, inspiredRouteString);
        }
        this.updateControlColor(ROUTE_TYPE_ID, isRouteTypeValid);
    }

    updatePathLength(isLengthValid, length) {
        this.updateControlValue(PATH_LENGTH_ID, length, 'km');
        this.updateControlColor(PATH_LENGTH_ID, isLengthValid);
    }

    updateElevationGain(isElevationGainValid, elevationGain) {
        this.updateControlValue(ELEVATION_GAIN_ID, elevationGain, 'm');
        this.updateControlColor(ELEVATION_GAIN_ID, isElevationGainValid);
    }

    updateElevationLoss(isElevationLossValid, elevationLoss) {
        this.updateControlValue(ELEVATION_LOSS_ID, elevationLoss, 'm');
        this.updateControlColor(ELEVATION_LOSS_ID, isElevationLossValid);
    }

    updateElevationTotalChange(isElevationTotalChangeValid, elevationTotalChange) {
        this.updateControlValue(ELEVATION_TOTAL_CHANGE_ID, elevationTotalChange, 'm');
        this.updateControlColor(ELEVATION_TOTAL_CHANGE_ID, isElevationTotalChangeValid);
    }

    updateNumberOfStations(areAllStationsPresent) {
        this.updateControlColor(NUMBER_OF_STATIONS_ID, areAllStationsPresent);
    }

    updateStationsOrder(isStationOrderCorrect) {
        this.updateControlColor(STATIONS_ORDER_ID, isStationOrderCorrect);
    }

    updateStationsOnPath(areAllStationsOnPath) {
        this.updateControlColor(STATIONS_ON_PATH_ID, areAllStationsOnPath);
    }

    updateSinglePath(isSinglePath) {
        this.updateControlColor(SINGLE_PATH_ID, isSinglePath);
    }

    updateDataConsistency(isDataConsistent) {
        this.updateControlColor(DATA_CONSISTENCY_ID, isDataConsistent);
    }

    drawElevationChart(pathElevation) {
        const X_AXIS_NUMBER_OF_LABELS = 10;
        const X_AXIS_LABEL_STRING = '[km]';
        const Y_AXIS_LABEL_STRING = '[m]';
        const CHART_BACKGROUND_COLOR = 'rgb(32, 77, 116)';

        const labelWidth = parseInt(pathElevation.length / X_AXIS_NUMBER_OF_LABELS, 10);
        const labels = _.map(pathElevation, elevation => elevation.distance.toFixed());
        const data = _.map(pathElevation, elevation => elevation.elevation);

        logger.debug('Drawing elevation chart. Input:', pathElevation);

        // eslint-disable-next-line no-unused-vars
        this.elevationChart = new Chart($(ELEVATION_CHART_ID), {
            type: 'line',
            data: {
                labels,
                datasets: [
                    {
                        label: '',
                        data,
                        fill: 'start',
                        radius: 0,
                        backgroundColor: CHART_BACKGROUND_COLOR
                    }
                ]
            },
            options: {
                scales: {
                    xAxes: [
                        {
                            scaleLabel: {
                                display: true,
                                labelString: X_AXIS_LABEL_STRING
                            },
                            ticks: {
                                callback: (dataLabel, index) =>
                                    index % labelWidth === 0 || index === pathElevation.length - 1 ? dataLabel : null
                            }
                        }
                    ],
                    yAxes: [
                        {
                            scaleLabel: {
                                display: true,
                                labelString: Y_AXIS_LABEL_STRING
                            }
                        }
                    ]
                },
                legend: {
                    display: false
                },
                tooltips: {
                    enabled: false
                }
            }
        });
    }

    // eslint-disable-next-line class-methods-use-this
    resetElevationChart() {
        const elevationChartParentElement = $(ELEVATION_CHART_ID).parent();
        $(ELEVATION_CHART_ID).remove();
        elevationChartParentElement.append(ELEVATION_CHART_ELEMENT);
    }

    // eslint-disable-next-line class-methods-use-this
    resetFailedVerificationModal() {
        $(FAILED_VERIFICATION_MODAL_BODY)
            .children()
            .remove();
    }

    // eslint-disable-next-line class-methods-use-this
    addLoaderToButton() {
        $(VERIFY_BUTTON_ID).append(LOADER_ELEMENT);
    }

    // eslint-disable-next-line class-methods-use-this
    removeLoaderFromButton() {
        $(`${VERIFY_BUTTON_ID} ${LOADER_ID}`).remove();
    }

    resetAll(value) {
        const text = '';
        const isValid = value === undefined ? null : value;

        this.updateControlValue(ROUTE_TYPE_ID, text);
        this.updateControlColor(ROUTE_TYPE_ID, isValid);
        this.updateControlValue(PATH_LENGTH_ID, text);
        this.updateControlColor(PATH_LENGTH_ID, isValid);
        this.updateControlValue(ELEVATION_GAIN_ID, text);
        this.updateControlColor(ELEVATION_GAIN_ID, isValid);
        this.updateControlValue(ELEVATION_LOSS_ID, text);
        this.updateControlColor(ELEVATION_LOSS_ID, isValid);
        this.updateControlValue(ELEVATION_TOTAL_CHANGE_ID, text);
        this.updateControlColor(ELEVATION_TOTAL_CHANGE_ID, isValid);
        this.updateControlColor(NUMBER_OF_STATIONS_ID, isValid);
        this.updateControlColor(STATIONS_ORDER_ID, isValid);
        this.updateControlColor(STATIONS_ON_PATH_ID, isValid);
        this.updateControlColor(SINGLE_PATH_ID, isValid);
        this.updateControlColor(DATA_CONSISTENCY_ID, isValid);
        this.resetElevationChart();
        this.resetFailedVerificationModal();
    }

    // eslint-disable-next-line class-methods-use-this
    showVerificationSuccessModal() {
        $(SUCCESS_VERIFICATION_MODAL_ID).modal();
    }

    // eslint-disable-next-line class-methods-use-this
    showVerificationFailedModal(errors = []) {
        let errorsListHtml = '';
        errorsListHtml += '<div><ul>';
        errors.forEach(error => {
            errorsListHtml += `<li>${error}</li>`;
        });
        errorsListHtml += '</ul></div>';

        $(FAILED_VERIFICATION_MODAL_BODY).append(errorsListHtml);
        $(FAILED_VERIFICATION_MODAL_ID).modal();
    }

    get() {
        const { verificationOutput } = this;
        const logs = verificationOutput.getLogs();

        this.removeLoaderFromButton();
        this.updateSinglePath(verificationOutput.getSinglePathStatus());
        this.updatePathLength(true, verificationOutput.getPathLength());
        this.updateRouteType(verificationOutput.getRouteTypeStatus(), verificationOutput.getRouteType());
        this.updateNumberOfStations(verificationOutput.getNumberOfStationsStatus());
        this.updateStationsOrder(verificationOutput.getStationsOrderStatus());
        this.updateStationsOnPath(verificationOutput.getStationsOnPathStatus());
        this.updateElevationGain(true, verificationOutput.getElevationGain());
        this.updateElevationLoss(true, verificationOutput.getElevationLoss());
        this.updateElevationTotalChange(true, verificationOutput.getElevationTotalChange());
        this.drawElevationChart(verificationOutput.getElevationCharacteristics());

        if (logs.length === 0) {
            this.showVerificationSuccessModal();
        } else {
            this.showVerificationFailedModal(logs);
        }
    }
}
