# syntax=docker/dockerfile:1
FROM rust:1.92.0-slim-trixie AS builder

WORKDIR /src
COPY . .

RUN --mount=type=cache,target=/usr/local/cargo/registry cargo build --release --target-dir target

FROM debian:trixie-slim
WORKDIR /srv/app
ENTRYPOINT ["/usr/local/bin/koenokatachibot"]
RUN apt-get update && apt-get install -y --no-install-recommends ca-certificates ffmpeg && rm -rf /var/lib/apt/lists/*
COPY --from=builder /src/target/release/koenokatachibot  /usr/local/bin/koenokatachibot