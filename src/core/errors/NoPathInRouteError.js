/**
 * Error representing specific problem in Route - no path defined
 */
export default class NoPathInRouteError extends Error {
    /**
     * @param {string} message - error message
     */
    constructor(message = 'Route has no path') {
        super(message);
        this.name = 'NoPathInRouteError';
    }
}
