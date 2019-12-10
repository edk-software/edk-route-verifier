import {
    distance as turfDistance,
    flatten as turfFlatten,
    lineDistance,
    lineSliceAlong as turfLineSliceAlong,
    pointToLineDistance as turfPointToLineDistance,
    nearestPointOnLine as turfNearestPointOnLine,
    helpers as turfHelpers
} from '@turf/turf';

export const distance = turfDistance;
export const flatten = turfFlatten;
export const length = lineDistance;
export const lineSliceAlong = turfLineSliceAlong;
export const point = turfHelpers.point;
export const pointToLineDistance = turfPointToLineDistance;
export const nearestPointOnLine = turfNearestPointOnLine;
export const options = { units: 'meters' };

export default {
    distance,
    flatten,
    length,
    lineSliceAlong,
    point,
    pointToLineDistance,
    nearestPointOnLine,

    options
};
