# syntax = docker/dockerfile:1

ARG NODE_VERSION="18.18.0"
ARG BASE_VERSION="alpine3.17"

FROM node:${NODE_VERSION}-${BASE_VERSION} as builder

WORKDIR /app

ARG VITE_GPT_URL
ARG VITE_GPT_AUTH
ARG VITE_INSIGHTS_API_URL

ENV VITE_GPT_URL $VITE_GPT_URL
ENV VITE_GPT_AUTH $VITE_GPT_AUTH
ENV VITE_INSIGHTS_API_URL $VITE_INSIGHTS_API_URL

RUN apk --no-cache add git

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