#!/bin/sh
export JSON_STRING='window.configs = {}'
sed "s|//CONFIGURATIONS_PLACEHOLDER|${JSON_STRING}|" /usr/share/nginx/html/insights/index.html.tmpl > /tmp/index.html

exec "$@"