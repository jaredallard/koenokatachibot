#!/usr/bin/env bash
set -euo pipefail

image_name="ghcr.io/jaredallard/koenokatachibot:devel"
docker buildx build -t "$image_name" .
docker run -it --restart=on-failure \
  -v "$(pwd)/config:/srv/app/config" \
  -v "$(pwd)/data:/srv/app/data:ro" \
  -v "$(pwd)/timestamps:/srv/app/timestamps" \
  -d "$image_name"
