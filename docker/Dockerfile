# syntax = docker/dockerfile:1

ARG OLD_IMAGE="insights-webapp:latest"
ARG KEEP_DAYS=60
ARG ASSETS_IMAGE

FROM ${ASSETS_IMAGE} AS builder

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

RUN cd /usr/share/nginx/html/insights/ \
    && /file_handler.sh css

COPY --from=builder --chown=nginx:nginx /app/dist /usr/share/nginx/html/insights/

RUN mv /usr/share/nginx/html/insights/index.html /usr/share/nginx/html/insights/index.html.tmpl \
    && cd /usr/share/nginx/html/insights/ \
    && ln -s /tmp/index.html

EXPOSE 8080
ENTRYPOINT ["/docker-entrypoint.sh"]
CMD ["nginx", "-g", "daemon off;"]
