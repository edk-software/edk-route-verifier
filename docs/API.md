## API

**EDK Route Verifier** in API flavour provides user HTTP server with endpoint to run route verification.

### Configuration

If you want to start server with Basic HTTP Authentication for all exposed endpoints setup `apiUser` and `apiPass` in configuration file.

See: [configuration file template](../conf/config.json.template).

### Start

Assuming your configuration file is `config.json` you can start  
```shell script
edk-route-verifer server -c config.json
```
See [server command usage](../docs/USAGE_SERVER.md) for details.

Server is started on `localhost`. Port is presented to the user. It can be changed using `-p` switch in command.


### Endpoints

#### POST /api/verify

##### Request

```
{
    kml: <string>
}
```

##### Response

###### Success
```shell script
{
    routeCharacteristics: {
        elevationCharacteristics: <array of { elevation: <number>, distance: <number> }>,
        pathStart: { latitude: <number>, longitude: <number> },
        pathEnd: { latitude: <number>, longitude: <number> },
        pathCoordinates: <array of { latitude: <number>, longitude: <number> }>
        stations: <array of { index: <number>, latitude: <number>, longitude: <number> }>
    },
    verificationStatuses: {
        singlePath: { valid: <boolean> },
        pathLength: { valid: <boolean>, value: <number> },
        routeType: { valid: <boolean>, value: <number> },
        numberOfStations: { valid: <boolean> },
        stationsOrder: { valid: <boolean> },
        stationsOnPath: { valid: <boolean> },
        elevationGain: { valid: <boolean>, value: <number> },
        elevationLoss: { valid: <boolean>, value: <number> },
        elevationTotalChange: { valid: <boolean>, value: <number> },
        logs: <array of strings>
    }
}
```

###### Error
```shell script
{
    error: <string>
    message: <string>
}
```
* error - error code
* message - error message
