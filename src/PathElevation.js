const getGain = elevations => {
    let elevationGain = 0.0;
    for(let i = 1; i < elevations.length; i++) {
        const elevationDifference = elevations[i].elevation - elevations[i-1].elevation;
        elevationGain += (elevationDifference > 0) ? elevationDifference : 0.0;
    }
    return Number(elevationGain);
}

const getLoss = elevations => {
    let elevationLoss = 0.0;
    for(let i = 1; i < elevations.length; i++) {
        const elevationDifference = elevations[i-1].elevation - elevations[i].elevation;
        elevationLoss += (elevationDifference > 0) ? elevationDifference : 0.0;
    }
    return Number(elevationLoss);
}



export default class PathElevation {
    constructor(elevations, length) {
        this.gain = getGain(elevations);
        this.loss = getLoss(elevations);
        this.totalChange = this.loss + this.gain;
        this.data = elevations;
    }

    enrichData (length) {
        const elevationsWithDistance = [];
        const resolution = length / this.data.length;
        for(let i = 0; i < this.data.length; i++) {
            elevationsWithDistance.push({elevation: this.data[i].elevation, distance: i * resolution});
        }
        this.data = elevationsWithDistance;
    }
}



