/**
 * Error representing internal objects (configuration, language) initialization error
 */
export default class InternalObjectInitializationError extends Error {
    /**
     * @param {string} message - error message
     */
    constructor(message) {
        super(message);
        this.name = 'InternalObjectInitializationError';
    }
}
