const path = require('path');

module.exports = {
    moduleNameMapper: {
        './utils/turf.js': path.resolve(__dirname, '.jest/turf.js')
    }
};
