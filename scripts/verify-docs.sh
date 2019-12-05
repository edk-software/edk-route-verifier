#!/usr/bin/env bash
set -e

DOC_PATH="docs/USAGE.md"
git diff --exit-code ./${DOC_PATH}
EXIT_CODE=$?

if [ "$EXIT_CODE" != "0" ]; then
  echo "ERROR: CLI help usage documentation not up-to-date with the source code. Follow these steps:"
  echo " - run 'npm run docs:create',"
  echo " - check output '${DOC_PATH}' file,"
  echo " - commit updated '${DOC_PATH}' file."
  exit 1
fi;
