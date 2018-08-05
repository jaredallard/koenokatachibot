FROM mhart/alpine-node:10

ENV NODE_ENV "production"
ENV DEBUG "knkb:*"

WORKDIR /srv/app

# Install dumb-init
RUN apk add --no-cache dumb-init

COPY package.json /srv/app
RUN yarn
COPY . /srv/app

ENTRYPOINT [ "/usr/bin/dumb-init", "node", "server.js" ]