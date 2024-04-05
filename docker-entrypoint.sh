#!/bin/sh
JSON_STRING='window.configs = { \
  "VITE_GPT_URL":"'${VITE_GPT_URL}'", \
  "VITE_GPT_AUTH":"'${VITE_GPT_AUTH}'", \
}'
sed "s|//CONFIGURATIONS_PLACEHOLDER|${JSON_STRING}|" /usr/share/nginx/html/smart-descriptions/index.html.tmpl > /tmp/index.html

exec "$@"