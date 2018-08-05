#!/usr/bin/env bash

docker build -t knkb .
docker run -it -v "$(pwd)/config:/srv/app/config" -v "$(pwd)/data:/srv/app/data" -d knkb