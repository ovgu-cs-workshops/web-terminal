#! /bin/sh

sed -i "s;ws://localhost:6032;${BROKER_URL};g" /usr/share/nginx/html/app.bundle.js
nginx -g "daemon off;"
