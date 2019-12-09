const path = require('path');

module.exports = {
    moduleNameMapper: {
        '.*turf.js': path.resolve(__dirname, '.jest/turf.js')
    }
};
