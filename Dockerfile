FROM node:19-alpine

ENV NODE_ENV "production"
ENV DEBUG "knkb:*"

WORKDIR /srv/app

# Install dumb-init
RUN apk add --no-cache dumb-init ffmpeg

COPY package.json /srv/app
RUN yarn
COPY . /srv/app

ENTRYPOINT [ "/usr/bin/dumb-init", "node", "server.js" ]