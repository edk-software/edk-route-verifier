#!/bin/bash

for filename in ./test/resources/2019/edk-gps-route-2*.kml; do
    npm run start:file $filename >> output2x.txt
done