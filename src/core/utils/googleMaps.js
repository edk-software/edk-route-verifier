import googleMaps from '@google/maps';
import Configuration from '../Configuration.js';

export function getClient() {
    const { googleMapsApiKey: key } = Configuration.getConfig();

    return googleMaps.createClient({ key, Promise });
}

export default getClient;
