# syntax = docker/dockerfile:1

ARG NODE_VERSION="18.19.1"
ARG BASE_VERSION="alpine3.19"
ARG OLD_IMAGE="insights-webapp:latest"
ARG KEEP_DAYS=60
ARG FIREBASE_CONFIG
ARG HOTJAR_ID

FROM node:${NODE_VERSION}-${BASE_VERSION} AS builder

WORKDIR /app

ARG KEEP_DAYS

ARG FIREBASE_CONFIG
ARG HOTJAR_ID

ENV PUBLIC_PATH_URL=https://insights.stg.cloud.weni.ai/
ENV INSIGHTS_API_URL=https://insights-engine.stg.cloud.weni.ai
ENV FIREBASE_CONFIG=$FIREBASE_CONFIG
ENV HOTJAR_ID=$HOTJAR_ID

RUN apk add --no-cache \
    git \
    build-base \
    cairo-dev \
    pango-dev \
    jpeg-dev \
    giflib-dev \
    librsvg-dev

COPY package.json package-lock.json ./

RUN --mount=type=cache,target=/root/.npm NPM_CONFIG_CACHE=/root/.npm npm install

COPY . ./

RUN npm run build

FROM ${OLD_IMAGE} AS old_css

FROM nginxinc/nginx-unprivileged:1.25-alpine
ARG OLD_IMAGE=${OLD_IMAGE}
ARG KEEP_DAYS

COPY --chown=nginx:nginx docker/nginx/nginx.conf /etc/nginx/nginx.conf
COPY --chown=nginx:nginx docker/nginx/headers /usr/share/nginx/html/headers
COPY --chown=nginx:nginx docker/file_handler.sh /
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
