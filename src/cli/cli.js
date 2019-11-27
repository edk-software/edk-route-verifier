import fs from 'fs';
import RouteParameters from '../data/input/RouteParameters.js';
import RouteVerificationInput from '../data/input/RouteVerificationInput.js';
import RouteVerificationOptions from '../data/input/RouteVerificationOptions.js';
import verifyRoute from '../core/verifyRoute.js';

const args = process.argv.slice(2);

const kml = fs.readFileSync(args[0], { encoding: 'UTF-8' });
const params = JSON.parse(fs.readFileSync(args[1]));
const routeParams = new RouteParameters(params.ascent, params.length, params.type);

const routeInput = new RouteVerificationInput(kml, routeParams);
const options = new RouteVerificationOptions('en', true);

verifyRoute(routeInput, options);
