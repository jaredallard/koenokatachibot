#!/usr/bin/env bash

docker build -t knkb .
docker run -it \
  -v "$(pwd)/config:/srv/app/config:ro" \
  -v "$(pwd)/data:/srv/app/data:ro" \
  -v "$(pwd)/timestamps:/srv/app/timestamps" \
  -d knkb
