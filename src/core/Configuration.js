import InternalObjectInitializationError from './errors/InternalObjectInitializationError.js';

let instance = null;

export default class Configuration {
    constructor(config) {
        this.config = config;
        instance = this;

        return instance;
    }

    static getConfig() {
        if (!instance) {
            throw new InternalObjectInitializationError('Internal configuration not initialized.');
        }

        return instance.config;
    }
}
