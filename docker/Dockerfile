# syntax = docker/dockerfile:1

ARG NODE_VERSION="20"
ARG BASE_VERSION="alpine"

FROM node:${NODE_VERSION}-${BASE_VERSION} as builder

WORKDIR /app

COPY package.json yarn.lock ./

RUN yarn install

COPY . .

RUN yarn build

FROM nginx:alpine

COPY nginx.conf /etc/nginx/nginx.conf

COPY --from=builder /app/dist /usr/share/nginx/html
COPY --from=builder --chown=nginx:nginx /app/dist /usr/share/nginx/html/insights/
COPY docker-entrypoint.sh /
RUN mv /usr/share/nginx/html/insights/index.html /usr/share/nginx/html/insights/index.html.tmpl \
    && cd /usr/share/nginx/html/insights/ \
    && ln -s /tmp/index.html

EXPOSE 8080
CMD ["nginx", "-g", "daemon off;"]