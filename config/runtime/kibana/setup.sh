#!/bin/sh

# This file should be mounted in the runtime docker container so that
# we may update it and have the changes propagate without the need
# to rebuild the docker image.

curl -X POST "http://kibana:5601/api/saved_objects/_bulk_create?overwrite=true" \
    -H 'kbn-xsrf: true' \
    -H 'Content-Type: application/json' \
    --data @/runtime/kibana/default.json \
    --retry 12 \
    --retry-delay 5
    