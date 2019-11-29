const getResultObject = valid => ({ valid });
const getResultObjectWithValue = (valid, value) => ({ ...getResultObject(valid), value });
const isValid = object => object.valid;

export default class RouteVerificationOutput {
    constructor() {
        const invalidObject = getResultObject(false);
        const invalidObjectWithValue = getResultObjectWithValue(false, 0.0);

        this.elevationCharacteristics = [];
        this.singlePath = invalidObject;
        this.pathLength = invalidObjectWithValue;
        this.routeType = invalidObject;
        this.numberOfStations = invalidObject;
        this.stationsOrder = invalidObject;
        this.stationsOnPath = invalidObject;
        this.elevationGain = invalidObjectWithValue;
        this.elevationLoss = invalidObjectWithValue;
        this.elevationTotalChange = invalidObjectWithValue;
        this.logs = [];
    }

    setElevationCharacteristics(data) {
        this.elevationCharacteristics = data;
    }

    setSinglePath(valid) {
        this.singlePath = getResultObject(valid);
    }

    setPathLength(valid, length) {
        this.pathLength = getResultObjectWithValue(valid, length);
    }

    setRouteType(valid) {
        this.routeType = getResultObject(valid);
    }

    setNumberOfStations(valid) {
        this.numberOfStations = getResultObject(valid);
    }

    setStationsOrder(valid) {
        this.stationsOrder = getResultObject(valid);
    }

    setStationsOnPath(valid) {
        this.stationsOnPath = getResultObject(valid);
    }

    setElevationGain(valid, value) {
        this.elevationGain = getResultObjectWithValue(valid, value);
    }

    setElevationLoss(valid, value) {
        this.elevationLoss = getResultObjectWithValue(valid, value);
    }

    setElevationTotalChange(valid, value) {
        this.elevationTotalChange = getResultObjectWithValue(valid, value);
    }

    setLogs(logsArray) {
        this.logs = logsArray;
    }

    getObject() {
        return {
            elevationCharacteristics: this.elevationCharacteristics,
            verificationStatus: {
                singlePath: this.singlePath,
                pathLength: this.pathLength,
                routeType: this.routeType,
                numberOfStations: this.numberOfStations,
                stationsOrder: this.stationsOrder,
                stationsOnPath: this.stationsOnPath,
                elevationGain: this.elevationGain,
                elevationLoss: this.elevationLoss,
                elevationTotalChange: this.elevationTotalChange,
                logs: this.logs
            }
        };
    }

    getStatus() {
        return (
            isValid(this.singlePath) &&
            isValid(this.pathLength) &&
            isValid(this.routeType) &&
            isValid(this.numberOfStations) &&
            isValid(this.stationsOrder) &&
            isValid(this.stationsOnPath) &&
            isValid(this.elevationGain) &&
            isValid(this.elevationLoss) &&
            isValid(this.elevationTotalChange)
        );
    }
}
