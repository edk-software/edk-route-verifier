import fs from 'fs';
import RouteParameters from './input/RouteParameters.mjs';
import RouteVerificationInput from './input/RouteVerificationInput.mjs';
import RouteVerificationOptions from './input/RouteVerificationOptions.mjs';
import { verifyRoute } from './verifyRoute.mjs';

const args = process.argv.slice(2);

const kml = fs.readFileSync(args[0], { encoding: 'UTF-8' });
const params = JSON.parse(fs.readFileSync(args[1]));
const routeParams = new RouteParameters(params.ascent, params.length, params.type);

const routeInput = new RouteVerificationInput(kml, routeParams);
const options = new RouteVerificationOptions('en', true);

verifyRoute(routeInput, options);
