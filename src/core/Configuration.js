let instance = null;

export default class Configuration {
    constructor(config) {
        if (!instance) {
            this.config = config;
            instance = this;
        }

        return instance;
    }

    static getConfig() {
        if (!instance) {
            throw new Error('Internal configuration not initialized.');
        }

        return instance.config;
    }
}
