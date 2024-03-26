# syntax = docker/dockerfile:1

ARG NODE_VERSION="18.14.0"
ARG BASE_VERSION="alpine3.17"

FROM node:${NODE_VERSION}-${BASE_VERSION} as builder

WORKDIR /home/app

ARG VITE_GPT_URL
ARG VITE_GPT_AUTH

ENV VITE_GPT_URL $VITE_GPT_URL
ENV VITE_GPT_AUTH $VITE_GPT_AUTH

COPY package.json .
COPY yarn.lock .
RUN yarn install
COPY . .
RUN yarn build

FROM nginx

COPY --from=builder /home/app/dist /usr/share/nginx/html

COPY ./docker/nginx/nginx.conf /etc/nginx
COPY docker-entrypoint.sh /usr/share/nginx/
RUN chmod +x /usr/share/nginx/docker-entrypoint.sh

EXPOSE 8080
ENTRYPOINT [ "/usr/share/nginx/docker-entrypoint.sh" ]
CMD ["nginx", "-g", "daemon off;"]