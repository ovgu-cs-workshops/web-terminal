FROM node:11-alpine as builder

WORKDIR /web-terminal

ADD package.json /web-terminal/package.json
ADD package-lock.json /web-terminal/package-lock.json
RUN npm ci
ADD . /web-terminal/
RUN npm run build

FROM nginx:1.16-alpine

ARG configuration=production
COPY --from=builder /web-terminal/dist/ /usr/share/nginx/html

ADD ./docker/start.sh /usr/bin
RUN chmod +x /usr/bin/start.sh

CMD ["/usr/bin/start.sh"]
