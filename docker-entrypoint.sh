#!/bin/sh
export JSON_STRING='window.configs = { \
  "VITE_GPT_URL":"'${VITE_GPT_URL}'", \
  "VITE_GPT_AUTH":"'${VITE_GPT_AUTH}'", \
  "VITE_INSIGHTS_API_URL":"'${VITE_INSIGHTS_API_URL}'", \
  "VITE_HOTJAR_ID":"'${VITE_HOTJAR_ID}'", \
}'
sed "s|//CONFIGURATIONS_PLACEHOLDER|${JSON_STRING}|" /usr/share/nginx/html/insights/index.html.tmpl > /tmp/index.html

exec "$@"