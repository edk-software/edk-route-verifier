/**
 * Error representing fetching data from Google Maps API error
 */
export default class GoogleMapsApiError extends Error {
    /**
     * @param {string} message - error message
     * @param {string} statusCode - error status code (from Google Maps API)
     * @param {string} statusMessage - error status message (from Google Maps API)
     */
    constructor(message, statusCode, statusMessage) {
        super(message);
        this.name = 'GoogleMapsApiError';
        this.statusCode = statusCode;
        this.statusMessage = statusMessage;
    }
}
