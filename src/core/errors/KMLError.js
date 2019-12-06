/**
 * Error representing problem with KML string
 */
export default class KMLError extends Error {
    /**
     * @param {string} kml - KML string
     * @param {string} message - error message
     */
    constructor(kml, message = 'KML parsing error') {
        super(message);
        this.name = 'KMLError';
        this.kml = kml;
    }
}
