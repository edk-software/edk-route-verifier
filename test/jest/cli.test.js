import _ from 'lodash';
import util from 'util';
import { readFile } from './common';

const exec = util.promisify(require('child_process').exec);

const getNodeCommand = path => {
    const fileContent = readFile(path);
    // eslint-disable-next-line no-control-regex
    const regex = RegExp('#!/usr/bin/env (.*)\n', 'i');
    return regex.exec(fileContent)[1];
};
const cliSourceFilePath = './src/cli/cli.js';
const nodeCommand = getNodeCommand(cliSourceFilePath);
const cliCmd = `${nodeCommand} ${cliSourceFilePath}`;

describe('CLI', () => {
    test('Usage help', async () => {
        const cmd = `${cliCmd} --help`;

        const { stdout, stderr } = await exec(cmd);
        const usageDocFile = _.replace(readFile('./docs/USAGE.md'), /```\n/gi, '');

        expect(stdout).toEqual(usageDocFile);
        expect(stderr).toEqual('');
    });

    test('Usage help for UI', async () => {
        const cmd = `${cliCmd} ui --help`;

        const { stdout, stderr } = await exec(cmd);
        const usageDocFile = _.replace(readFile('./docs/USAGE_UI.md'), /```\n/gi, '');

        expect(stdout).toEqual(usageDocFile);
        expect(stderr).toEqual('');
    });

    test('Usage help for File', async () => {
        const cmd = `${cliCmd} file --help`;

        const { stdout, stderr } = await exec(cmd);
        const usageDocFile = _.replace(readFile('./docs/USAGE_FILE.md'), /```\n/gi, '');

        expect(stdout).toEqual(usageDocFile);
        expect(stderr).toEqual('');
    });

    test('Usage help for Server', async () => {
        const cmd = `${cliCmd} server --help`;

        const { stdout, stderr } = await exec(cmd);
        const usageDocFile = _.replace(readFile('./docs/USAGE_SERVER.md'), /```\n/gi, '');

        expect(stdout).toEqual(usageDocFile);
        expect(stderr).toEqual('');
    });

    test('Verification successful', async () => {
        const cmd = `${cliCmd} file -c ./conf/config.json ./test/resources/01-regular.kml`;

        const { stdout, stderr } = await exec(cmd);

        expect(stdout).toMatch(
            new RegExp(
                'Route Characteristics:\n' +
                    '- Path Length: [0-9.]*km\n' +
                    '- Route Type: Normal\n' +
                    '- Elevation Gain: [0-9.]*m\n' +
                    '- Elevation Loss: [0-9.]*m\n' +
                    '- Elevation Total Change: [0-9.]*m\n' +
                    'Verification Status:\n' +
                    '- Single Path: OK\n' +
                    '- Route Type: OK\n' +
                    '- Number Of Stations: OK\n' +
                    '- Stations Order: OK\n' +
                    '- Stations On Path: OK\n'
            )
        );
        expect(stderr).toEqual('');
    });

    test('Verification failed', async () => {
        const cmd = `${cliCmd} file -c ./conf/config.json ./test/resources/21-two_path.kml`;

        const { stdout, stderr } = await exec(cmd);

        expect(stdout).toMatch(
            new RegExp(
                'Route Characteristics:\n' +
                    '- Path Length: [0-9.]*km\n' +
                    '- Route Type: Unknown\n' +
                    '- Elevation Gain: [0-9.]*m\n' +
                    '- Elevation Loss: [0-9.]*m\n' +
                    '- Elevation Total Change: [0-9.]*m\n' +
                    'Verification Status:\n' +
                    '- Single Path: Failed\n' +
                    '- Route Type: Failed\n' +
                    '- Number Of Stations: OK\n' +
                    '- Stations Order: OK\n' +
                    '- Stations On Path: Failed\n' +
                    'Errors:\n' +
                    'No single path defined.\n.*'
            )
        );
        expect(stderr).toEqual('');
    });
});
