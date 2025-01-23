#!/bin/sh

ESCAPED_FIREBASE_CONFIG=$(echo "${FIREBASE_CONFIG}" | sed 's/\//\\\//g')

export JSON_STRING='window.configs = { \
  "INSIGHTS_API_URL": "'${INSIGHTS_API_URL}'", \
  "FIREBASE_CONFIG": '${ESCAPED_FIREBASE_CONFIG}', \
  "HOTJAR_ID": "'${HOTJAR_ID}'", \
  "ENVIRONMENT": "'${ENVIRONMENT}'", \
  "SENTRY_DSN": "'${SENTRY_DSN}'", \
}'

sed "s|//CONFIGURATIONS_PLACEHOLDER|${JSON_STRING}|" /usr/share/nginx/html/insights/index.html.tmpl > /tmp/index.html

exec "$@"