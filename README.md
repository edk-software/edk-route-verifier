# edk-route-verifier

[![npm](https://img.shields.io/npm/v/edk-route-verifier.svg?style=flat)](https://www.npmjs.com/package/edk-route-verifier)
[![CircleCI](https://img.shields.io/circleci/project/github/cloudify-cosmo/cloudify-ui-components.svg?style=svg)](https://circleci.com/gh/cloudify-cosmo/cloudify-ui-components)
[![jest](https://img.shields.io/badge/tested_with-jest-99424f.svg)](https://github.com/facebook/jest)

**EDK Route Verifier** is a tool which allows user to verify provided KML file with [EDK](https://edk.org.pl) route against predefined set of rules (eg. minimal length) and provide route characteristics (eg. length, elevations).

It is delivered in 3 different flavours: API server, CLI tool and browser (UI) version.

[![browser](./docs/browser.png)](docs/BROWSER.md)

[![browser](docs/cli.png)](docs/CLI.md)

### Usage

#### Prerequisities
* [NodeJS](https://nodejs.org) >= v12.x (using ES modules)
* [Google Maps API Key](https://developers.google.com/maps/documentation/javascript/get-api-key) (using the following APIs: Google Maps Elevation API, Google Maps Embed API, Google Maps JavaScript API)

#### Installation
 
```shell script
npm install --global edk-route-verifier
```

#### Configuration

You need to create JSON configuration file containing at least Google Maps API key. 

You can use [config.json.template](conf/config.json.template) file as a base.


#### Start

Check out usage at in [CLI usage documentation](docs/USAGE.md) or just execute:
  
```shell script
edk-route-verifier --help
```

To start verifier you will need configuration file created in previous step. To run verifier as API server execute:

```shell script
edk-route-verifier server -c config.json
```

### Flavours

**EDK Route Verifier** is delivered in 3 different flavours: 

1. [API server](docs/API.md) - starts HTTP server exposing verification endpoint 
2. [CLI tool](docs/CLI.md) - allows user to verify EDK route from command line
3. [Browser version](docs/BROWSER.md) - allows user to verify EDK routes with web UI


### Testing

Tests are developed using [Jest](https://jestjs.io/) framework. All test-related code is stored in `test` subdirectory.

To run all tests (including static code analysis and documentation check):

```shell script
npm run start:server
npm run test
```

### Continuous Integration

[CircleCI](https://circleci.com/gh/edk-software/edk-route-verifier) web application is used as for CI management. See [.circleci/config.yml](.circleci/config.yml) file for details of the build and test job configuration.

You can create your own branch, push it remote and CI will start automatically. That way you can test your code even if you don't have local environment configured (NodeJS, Google Maps API Key, etc.).

### Deployment

`edk-route-verifier` is deployed in NPM registry. 

Follow this step-by-step guide to deploy new version:
1. Checkout `master` branch
2. Push all the changes to remote
3. Start API server: `npm run start:server` (assuming you have configuration file in `conf/config.json`)
4. Execute `npm run publish:[prerelease|patch|minor|major]`
5. After successful execution, check [CircleCI](https://circleci.com/gh/edk-software/edk-route-verifier)
5. If everything went fine, then create release in [GitHub releases](https://github.com/edk-software/edk-route-verifier/tags)
