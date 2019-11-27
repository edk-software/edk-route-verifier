let instance = null;

export default class LogBuffer {
    constructor() {
        if (!instance) {
            this.buffer = [];
            instance = this;
        }

        return instance;
    }

    add(message) {
        this.buffer.push(message);
    }

    getLogs() {
        return this.buffer;
    }

    cleanLogs() {
        this.buffer = [];
    }

    static getInstance() {
        return instance;
    }
}
