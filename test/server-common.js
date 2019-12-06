import request from 'request-promise-native';
import { readFileSync } from 'fs';
import { join } from 'path';

export function callVerifyApi(kml) {
    return request.post({
        method: 'POST',
        uri: 'http://localhost:9102/api/verify',
        body: { kml },
        json: true
    });
}

export function readKmlFile(name) {
    const kmlFilesPath = './test/resources';
    const kmlFilesExtension = '.kml';
    return readFileSync(join(kmlFilesPath, `${name}${kmlFilesExtension}`), 'utf8');
}

expect.extend({
    toBeWithinRange(received, rangeSize) {
        const floor = received - rangeSize / 2;
        const ceiling = received + rangeSize / 2;
        const pass = received >= floor && received <= ceiling;
        if (pass) {
            return {
                message: () => `expected ${received} not to be within range ${floor} - ${ceiling}`,
                pass: true
            };
        }
        return {
            message: () => `expected ${received} to be within range ${floor} - ${ceiling}`,
            pass: false
        };
    }
});
