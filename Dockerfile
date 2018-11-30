FROM node:11 as builder
  
WORKDIR /
RUN git clone https://github.com/ovgu-cs-workshops/web-terminal.git web-terminal
WORKDIR web-terminal

RUN npm ci
RUN npm run build

FROM nginx:latest

ARG configuration=production
COPY --from=builder /web-terminal/dist/ /usr/share/nginx/html

