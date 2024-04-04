# syntax = docker/dockerfile:1

ARG NODE_VERSION="20"
ARG BASE_VERSION="alpine"

FROM node:${NODE_VERSION}-${BASE_VERSION} as builder

WORKDIR /app

# RUN apk --no-cache add git

COPY package.json yarn.lock ./

# RUN --mount=type=cache,target=/root/.yarn \
#     YARN_CACHE_FOLDER=/root/.yarn yarn install

RUN yarn install

COPY . ./

RUN yarn build

FROM nginx:alpine

COPY --from=builder /app/dist /usr/share/nginx/html
COPY --from=builder --chown=nginx:nginx /app/dist /usr/share/nginx/html/insights/
COPY docker-entrypoint.sh /
RUN mv /usr/share/nginx/html/insights/index.html /usr/share/nginx/html/insights/index.html.tmpl \
    && cd /usr/share/nginx/html/insights/ \
    && ln -s /tmp/index.html

EXPOSE 8080
ENTRYPOINT ["/docker-entrypoint.sh"]
CMD ["nginx", "-g", "daemon off;"]