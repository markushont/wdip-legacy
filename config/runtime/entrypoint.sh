#!/bin/sh

# This entrypoint file is built into the docker image, which means
# that it needs to be rebuilt when making changes. Consider instead
# making changes to the mounted script in the kibana directory.

# Runs all setup.sh files found in sub directories
find /runtime -name 'setup.sh' -exec {} \;