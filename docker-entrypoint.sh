#!/bin/sh

ESCAPED_FIREBASE_CONFIG=$(echo "${VITE_FIREBASE_CONFIG}" | sed 's/\//\\\//g')

export JSON_STRING='window.configs = { \
  "VITE_INSIGHTS_API_URL": "'${VITE_INSIGHTS_API_URL}'", \
  "VITE_FIREBASE_CONFIG": '${ESCAPED_FIREBASE_CONFIG}', \
  "VITE_HOTJAR_ID": "'${VITE_HOTJAR_ID}'" \
}'

sed "s|//CONFIGURATIONS_PLACEHOLDER|${JSON_STRING}|" /usr/share/nginx/html/insights/index.html.tmpl > /tmp/index.html

exec "$@"