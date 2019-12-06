import logger from 'loglevel';
import RouteVerificationOutput from './RouteVerificationOutput.js';

export default class AbstractOutputAdapter {
    /**
     * verificationOutput RouteVerificationOutput
     */
    constructor() {
        this.verificationOutput = null;
    }

    /**
     * initializes adapter
     *
     * @param verificationOutput RouteVerificationOutput
     */
    init(verificationOutput) {
        if (!(verificationOutput instanceof RouteVerificationOutput)) {
            throw new Error('Invalid type of verification output.');
        }
        this.verificationOutput = verificationOutput;
    }

    /**
     * get adapted verification output
     */
    get() {
        logger.info(this.verificationOutput);

        throw new Error('Output adapter not implemented.');
    }

    /**
     * handle verification errors
     */
    static handleError() {
        throw new Error('Error handler not implemented.');
    }
}
