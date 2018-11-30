#! /bin/sh

sed -i "s;ws://localhost:4000;${BROKER_URL};g" /usr/share/nginx/html/app.bundle.js
nginx -g "daemon off;"
