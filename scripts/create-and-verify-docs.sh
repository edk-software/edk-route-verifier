#!/usr/bin/env bash
set -e

DOC_PATH="docs/USAGE.md"

# Create docs
CLI_HELP=$(npm run --silent start:cli -- --help)
echo "\`\`\`" > ${DOC_PATH}
echo "${CLI_HELP}" >> ${DOC_PATH}
echo "\`\`\`" >> ${DOC_PATH}

# Verify docs
git diff --exit-code ./${DOC_PATH}
EXIT_CODE=$?

if [ "$EXIT_CODE" != "0" ]; then
  echo ""
  echo "ERROR: CLI help usage documentation not up-to-date with the source code. Follow these steps:"
  echo " - check output '${DOC_PATH}' file,"
  echo " - commit updated '${DOC_PATH}' file."
  echo ""
  exit 1
fi;
