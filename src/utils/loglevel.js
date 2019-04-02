import logLevelLogger from 'loglevel';

class Logger {
    static buffer = [];

    static getBufferedLogs() {
        return Logger.buffer;
    }

    static cleanBufferedLogs() {
        Logger.buffer = [];
    }
}

export default {
    ...logLevelLogger,

    error: message => {
        Logger.buffer.push(message);
        logLevelLogger.error(message);
    },

    warn: message => {
        Logger.buffer.push(message);
        logLevelLogger.warn(message);
    },

    getBufferedLogs: Logger.getBufferedLogs,

    cleanBufferedLogs: Logger.cleanBufferedLogs,
};
