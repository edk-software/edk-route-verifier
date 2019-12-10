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
        elevationCharacteristics: <array of { elevation: <number>, distance: <number> }>    
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
