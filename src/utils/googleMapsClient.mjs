import googleMaps from '@google/maps';
import config from '../../server/config.json';

const googleMapsClient = googleMaps.createClient({
    key: config.googleMapsApiKey,
    Promise,
});

export default googleMapsClient;
