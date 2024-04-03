#!/bin/sh
export JSON_STRING='window.configs = { \
  "VUE_APP_GPT_URL":"'${VUE_APP_GPT_URL}'", \
  "VUE_APP_GPT_AUTH":"'${VUE_APP_GPT_AUTH}'", \
}'
sed "s|//CONFIGURATIONS_PLACEHOLDER|${JSON_STRING}|" /usr/share/nginx/html/insights/index.html.tmpl > /tmp/index.html

exec "$@"