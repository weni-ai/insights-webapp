# syntax = docker/dockerfile:1

ARG NODE_VERSION="18.18.0"
ARG BASE_VERSION="alpine3.17"

FROM node:${NODE_VERSION}-${BASE_VERSION} as builder

WORKDIR /app

ARG VITE_FIREBASE_CONFIG

ENV VITE_FIREBASE_CONFIG $VITE_FIREBASE_CONFIG
ENV VITE_HOTJAR_ID $VITE_HOTJAR_ID

RUN apk --no-cache add git

RUN apk add --no-cache \
    build-base \
    cairo-dev \
    pango-dev \
    jpeg-dev \
    giflib-dev \
    librsvg-dev

COPY package.json yarn.lock ./

RUN --mount=type=cache,target=/root/.yarn \
    YARN_CACHE_FOLDER=/root/.yarn yarn install

COPY . ./

RUN yarn build

FROM nginxinc/nginx-unprivileged:1.25-alpine

COPY --chown=nginx:nginx docker/nginx/nginx.conf /etc/nginx/nginx.conf
COPY --from=builder --chown=nginx:nginx /app/dist /usr/share/nginx/html/insights/
COPY docker-entrypoint.sh /
RUN mv /usr/share/nginx/html/insights/index.html /usr/share/nginx/html/insights/index.html.tmpl \
    && cd /usr/share/nginx/html/insights/ \
    && ln -s /tmp/index.html

EXPOSE 8080
ENTRYPOINT ["/docker-entrypoint.sh"]
CMD ["nginx", "-g", "daemon off;"]