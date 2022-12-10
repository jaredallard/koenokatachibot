# syntax=docker/dockerfile:experimental
FROM rust:1 as builder
WORKDIR /src
COPY . .
RUN --mount=type=cache,target=/usr/local/cargo/registry --mount=type=cache,target=/src/target cargo build --release --target-dir target
RUN --mount=type=cache,target=/src/target mkdir -p release && cp target/release/koenokatachibot release/koenokatachibot

FROM debian:bullseye-slim
ENTRYPOINT ["/usr/local/bin/koenokatachibot"]
RUN apt-get update && apt-get install -y --no-install-recommends ca-certificates ffmpeg && rm -rf /var/lib/apt/lists/*
COPY --from=builder /src/release/koenokatachibot /usr/local/bin/koenokatachibot