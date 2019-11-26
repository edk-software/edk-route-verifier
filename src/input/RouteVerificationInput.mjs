import RouteParameters from './RouteParameters.mjs';

export default class RouteVerificationInput {
    constructor(kmlString, routeParams) {
        if (!(routeParams instanceof RouteParameters)) {
            throw Error('Invalid type of routeParams argument. Must be RouteParameters class instance.');
        }
        this.kml = kmlString;
        this.routeParams = routeParams;
    }
}
