import { isEmpty, isNumber } from '../core/utils/lodash.js';

export default class RouteVerificationOutput {
    constructor(json) {
        this.calculateNumeric = value => (isNumber(value) ? parseFloat(value.toFixed(2)) : null);

        if (isEmpty(json)) {
            this.elevationCharacteristics = [];
            this.pathStart = {};
            this.pathEnd = {};
            this.stations = [];
            this.singlePath = false;
            this.pathLength = 0.0;
            this.routeType = 2;
            this.routeTypeStatus = false;
            this.numberOfStations = false;
            this.stationsOrder = false;
            this.stationsOnPath = false;
            this.elevationGain = 0.0;
            this.elevationLoss = 0.0;
            this.elevationTotalChange = 0.0;
            this.logs = [];
        } else {
            const { routeCharacteristics, verificationStatus } = json;
            this.setElevationCharacteristics(routeCharacteristics.elevationCharacteristics);
            this.setPathStart(routeCharacteristics.pathStart);
            this.setPathEnd(routeCharacteristics.pathEnd);
            this.setStations(routeCharacteristics.stations);
            this.setSinglePath(verificationStatus.singlePath.valid);
            this.setPathLength(verificationStatus.pathLength.value);
            this.setRouteType(verificationStatus.routeType.valid, verificationStatus.routeType.value);
            this.setNumberOfStations(verificationStatus.numberOfStations.valid);
            this.setStationsOrder(verificationStatus.stationsOrder.valid);
            this.setStationsOnPath(verificationStatus.stationsOnPath.valid);
            this.setElevationGain(verificationStatus.elevationGain.value);
            this.setElevationLoss(verificationStatus.elevationLoss.value);
            this.setElevationTotalChange(verificationStatus.elevationTotalChange.value);
            this.setLogs(verificationStatus.logs);
        }
    }

    setElevationCharacteristics(data) {
        this.elevationCharacteristics = data;
    }

    setPathStart(pathStart) {
        this.pathStart = pathStart;
    }

    setPathEnd(pathEnd) {
        this.pathEnd = pathEnd;
    }

    setStations(stations) {
        this.stations = stations;
    }

    setSinglePath(valid) {
        this.singlePath = valid;
    }

    setPathLength(length) {
        this.pathLength = length;
    }

    setRouteType(valid, type) {
        this.routeType = type;
        this.routeTypeStatus = valid;
    }

    setNumberOfStations(valid) {
        this.numberOfStations = valid;
    }

    setStationsOrder(valid) {
        this.stationsOrder = valid;
    }

    setStationsOnPath(valid) {
        this.stationsOnPath = valid;
    }

    setElevationGain(value) {
        this.elevationGain = value;
    }

    setElevationLoss(value) {
        this.elevationLoss = value;
    }

    setElevationTotalChange(value) {
        this.elevationTotalChange = value;
    }

    setLogs(logsArray) {
        this.logs = logsArray;
    }

    getStatus() {
        return (
            this.singlePath &&
            this.routeTypeStatus &&
            this.numberOfStations &&
            this.stationsOrder &&
            this.stationsOnPath
        );
    }

    getElevationCharacteristics() {
        return this.elevationCharacteristics;
    }

    getPathStart() {
        return this.pathStart;
    }

    getPathEnd() {
        return this.pathEnd;
    }

    getStations() {
        return this.stations;
    }

    getSinglePathStatus() {
        return this.singlePath;
    }

    getPathLength() {
        return this.calculateNumeric(this.pathLength);
    }

    getRouteType() {
        return this.routeType;
    }

    getRouteTypeStatus() {
        return this.routeTypeStatus;
    }

    getNumberOfStationsStatus() {
        return this.numberOfStations;
    }

    getStationsOrderStatus() {
        return this.stationsOrder;
    }

    getStationsOnPathStatus() {
        return this.stationsOnPath;
    }

    getElevationGain() {
        return this.calculateNumeric(this.elevationGain);
    }

    getElevationLoss() {
        return this.calculateNumeric(this.elevationLoss);
    }

    getElevationTotalChange() {
        return this.calculateNumeric(this.elevationTotalChange);
    }

    getLogs() {
        return this.logs;
    }
}
