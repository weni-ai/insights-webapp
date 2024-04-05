# syntax = docker/dockerfile:1

ARG NODE_VERSION="20.10.0"
ARG BASE_VERSION="alpine3.19"

FROM node:${NODE_VERSION}-${BASE_VERSION} as builder

WORKDIR /app

COPY package.json yarn.lock ./

RUN --mount=type=cache,target=/root/.yarn YARN_CACHE_FOLDER=/root/.yarn yarn install

COPY . .

RUN yarn build

FROM nginx:alpine

COPY nginx.conf /etc/nginx/nginx.conf

COPY --chown=nginx:nginx nginx.conf /etc/nginx/nginx.conf
COPY --from=builder --chown=nginx:nginx /app/dist /usr/share/nginx/html/smart-descriptions/
COPY docker-entrypoint.sh /
RUN mv /usr/share/nginx/html/smart-descriptions/index.html /usr/share/nginx/html/smart-descriptions/index.html.tmpl \
    && cd /usr/share/nginx/html/smart-descriptions/ \
    && ln -s /tmp/index.html


EXPOSE 8080
ENTRYPOINT ["/docker-entrypoint.sh"]
CMD ["nginx", "-g", "daemon off;"]