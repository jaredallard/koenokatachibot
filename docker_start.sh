#!/usr/bin/env bash
set -e

docker buildx build -t knkb .
docker run -it --restart=on-failure \
  -v "$(pwd)/config:/srv/app/config" \
  -v "$(pwd)/data:/srv/app/data:ro" \
  -v "$(pwd)/timestamps:/srv/app/timestamps" \
  -d knkb
