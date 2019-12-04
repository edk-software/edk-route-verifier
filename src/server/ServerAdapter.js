import AbstractOutputAdapter from '../data/AbstractOutputAdapter.js';

export default class ServerAdapter extends AbstractOutputAdapter {
    get() {
        const output = this.verificationOutput;
        return {
            elevationCharacteristics: output.getElevationCharacteristics(),
            verificationStatus: {
                singlePath: {
                    valid: output.getSinglePathStatus()
                },
                pathLength: {
                    valid: true,
                    value: output.getPathLength()
                },
                routeType: {
                    valid: output.getRouteTypeStatus(),
                    value: output.getRouteType()
                },
                numberOfStations: {
                    valid: output.getNumberOfStationsStatus()
                },
                stationsOrder: {
                    valid: output.getStationsOrderStatus()
                },
                stationsOnPath: {
                    valid: output.getStationsOnPathStatus()
                },
                elevationGain: {
                    valid: true,
                    value: output.getElevationGain()
                },
                elevationLoss: {
                    valid: true,
                    value: output.getElevationLoss()
                },
                elevationTotalChange: {
                    valid: true,
                    value: output.getElevationTotalChange()
                },
                logs: output.getLogs()
            }
        };
    }
}
