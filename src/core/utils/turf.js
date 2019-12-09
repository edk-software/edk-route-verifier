import turf from '@turf/turf';

export const { distance } = turf;
export const length = turf.lineDistance;
export const { lineSliceAlong } = turf;
export const { flatten } = turf;
export const { point } = turf;
export const { pointToLineDistance } = turf;
export const { nearestPointOnLine } = turf;
export const options = { units: 'meters' };

export default {
    distance,
    length,
    lineSliceAlong,
    flatten,
    point,
    pointToLineDistance,
    nearestPointOnLine,

    options
};
