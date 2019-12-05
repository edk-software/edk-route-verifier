Usage: edk-route-verifier <command> -c <config-file> [options]

Commands:
  edk-route-verifier server [options] [-p port]  Starts server providing verification API
  edk-route-verifier file [options] <kml>        Verify provided KML file
  edk-route-verifier browser [options]           Run browser version of the verifer

Options:
  -c, --config    Configuration JSON file path (should contain googleMapsApiKey)  [string] [required]
  -l, --language  Logs language  [choices: "en", "pl"] [default: "en"]
  -d, --debug     Include debugging data  [boolean] [default: false]
  -h, --help      Show help  [boolean]
  -v, --version   Show version number  [boolean]

Examples:
  edk-route-verifier server -c config.json -p 9102              starts API server on port 9102
  edk-route-verifier file -c config.json my_route.kml           verifies my_route.kml
  edk-route-verifier file -c config.json -l pl -d my_route.kml  verifies my_route.kml and provides debug information in Polish language
  edk-route-verifier browser -c config.json                     starts API and static web content server
