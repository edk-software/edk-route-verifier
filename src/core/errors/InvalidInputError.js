/**
 * Error representing invalid input
 */
export default class InvalidInputError extends Error {
    /**
     * @param {string} message - error message
     * @param {string} input - input value
     */
    constructor(message, input) {
        super(message);
        this.name = 'InvalidInputError';
        this.input = input;
    }
}
