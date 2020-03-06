/**
 * Error representing problem with accessing a file
 */
export default class FileError extends Error {
    /**
     * @param {string} filename - file name
     * @param {string} message - error message
     */
    constructor(filename, message = 'File error') {
        super(message);
        this.name = 'FileError';
        this.filename = filename;
    }
}
