# syntax = docker/dockerfile:1

ARG NODE_VERSION="18.18.0"
ARG BASE_VERSION="alpine3.17"
ARG OLD_IMAGE="insights-webapp:latest"
ARG KEEP_DAYS=60

FROM node:${NODE_VERSION}-${BASE_VERSION} AS builder

WORKDIR /app

ARG KEEP_DAYS=${KEEP_DAYS}

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

FROM ${OLD_IMAGE} AS old_css

FROM nginxinc/nginx-unprivileged:1.25-alpine
ARG OLD_IMAGE=${OLD_IMAGE}
ARG KEEP_DAYS=${KEEP_DAYS}

COPY --chown=nginx:nginx docker/nginx/nginx.conf /etc/nginx/nginx.conf
COPY --chown=nginx:nginx docker/nginx/headers /usr/share/nginx/html/headers
COPY docker/file_handler.sh /
COPY --from=builder --chown=nginx:nginx /app/dist /usr/share/nginx/html/insights/
COPY --from=old_css --chown=nginx:nginx /usr/share/nginx/html/insights/assets/all.tx[t] /usr/share/nginx/html/insights/assets/*.css /usr/share/nginx/html/insights/assets/

COPY docker-entrypoint.sh /

RUN mv /usr/share/nginx/html/insights/index.html /usr/share/nginx/html/insights/index.html.tmpl \
    && cd /usr/share/nginx/html/insights/ \
    && ln -s /tmp/index.html \
    && /file_handler.sh css

EXPOSE 8080
ENTRYPOINT ["/docker-entrypoint.sh"]
CMD ["nginx", "-g", "daemon off;"]
