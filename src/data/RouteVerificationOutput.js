import { isEmpty, isNumber } from '../core/utils/lodash.js';

export default class RouteVerificationOutput {
    constructor(json) {
        this.calculateNumeric = value => (isNumber(value) ? parseFloat(value.toFixed(2)) : null);

        if (isEmpty(json)) {
            this.elevationCharacteristics = [];
            this.pathStart = {};
            this.pathEnd = {};
            this.pathCoordinates = [];
            this.stations = [];
            this.singlePath = false;
            this.pathLength = 0.0;
            this.pathLengthStatus = false;
            this.routeType = 2;
            this.routeTypeStatus = false;
            this.numberOfStations = false;
            this.stationsOrder = false;
            this.stationsOnPath = false;
            this.elevationGain = 0.0;
            this.elevationGainStatus = false;
            this.elevationLoss = 0.0;
            this.elevationTotalChange = 0.0;
            this.logs = [];
        } else {
            const { routeCharacteristics, verificationStatus } = json;
            this.setElevationCharacteristics(routeCharacteristics.elevationCharacteristics);
            this.setPathStart(routeCharacteristics.pathStart);
            this.setPathEnd(routeCharacteristics.pathEnd);
            this.setPathCoordinates(routeCharacteristics.pathCoordinates);
            this.setStations(routeCharacteristics.stations);
            this.setSinglePath(verificationStatus.singlePath.valid);
            this.setPathLength(verificationStatus.pathLength.valid, verificationStatus.pathLength.value);
            this.setRouteType(verificationStatus.routeType.valid, verificationStatus.routeType.value);
            this.setNumberOfStations(verificationStatus.numberOfStations.valid);
            this.setStationsOrder(verificationStatus.stationsOrder.valid);
            this.setStationsOnPath(verificationStatus.stationsOnPath.valid);
            this.setElevationGain(verificationStatus.elevationGain.valid, verificationStatus.elevationGain.value);
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

    setPathCoordinates(pathCoordinates) {
        this.pathCoordinates = pathCoordinates;
    }

    setStations(stations) {
        this.stations = stations;
    }

    setSinglePath(valid) {
        this.singlePath = valid;
    }

    setPathLength(valid, length) {
        this.pathLength = length;
        this.pathLengthStatus = valid;
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

    setElevationGain(valid, value) {
        this.elevationGain = value;
        this.elevationGainStatus = valid;
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
            this.elevationGainStatus &&
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

    getPathCoordinates() {
        return this.pathCoordinates;
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

    getPathLengthStatus() {
        return this.pathLengthStatus;
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

    getElevationGainStatus() {
        return this.elevationGainStatus;
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
