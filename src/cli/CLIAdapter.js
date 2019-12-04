import logger from 'loglevel';
import AbstractOutputAdapter from '../data/AbstractOutputAdapter.js';

export default class CLIAdapter extends AbstractOutputAdapter {
    get() {
        const output = this.verificationOutput;
        const getStatusString = status => (status ? 'OK' : 'Failed');
        const getRouteTypeString = type => {
            switch (type) {
                case 0:
                    return 'Normal';
                case 1:
                    return 'Inspired';
                case 2:
                default:
                    return 'Unknown';
            }
        };

        logger.info('\nRoute characteristics:');
        logger.info(`- Path Length: ${output.getPathLength()}km`);
        logger.info(`- Route Type: ${getRouteTypeString(output.getRouteType())}`);
        logger.info(`- Elevation Gain: ${output.getElevationGain()}m`);
        logger.info(`- Elevation Loss: ${output.getElevationLoss()}m`);
        logger.info(`- Elevation Total Change: ${output.getElevationTotalChange()}m`);

        logger.info(`\nVerification Status: ${getStatusString(output.getStatus())}`);
        logger.info(`- Single Path: ${getStatusString(output.getSinglePathStatus())}`);
        logger.info(`- Route Type: ${getStatusString(output.getRouteTypeStatus())}`);
        logger.info(`- Number Of Stations: ${getStatusString(output.getNumberOfStationsStatus())}`);
        logger.info(`- Stations Order: ${getStatusString(output.getStationsOrderStatus())}`);
        logger.info(`- Stations On Path: ${getStatusString(output.getStationsOnPathStatus())}`);

        if (!output.getStatus()) {
            logger.info(`\nLogs:`);
            logger.info(output.getLogs().join('\n'));
        }
    }
}
