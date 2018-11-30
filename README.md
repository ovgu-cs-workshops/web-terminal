# Web Terminal Frontend

This repository contains a simple web terminal based on:

- [preact](https://github.com/developit/preact)
- [unistore](https://github.com/developit/unistore)
- [Sass](https://github.com/sass/node-sass)
- [Typescript](https://www.typescriptlang.org/)
- [Webpack 4](https://webpack.js.org/)
- [WAMP](https://wamp-proto.org/)
- [cmanager](https://github.com/ovgu-cs-workshops/cmanager)
- [git-userland](https://github.com/ovgu-cs-workshops/git-userland)
- [autobahnkreuz](https://github.com/EmbeddedEnterprises/autobahnkreuz)

This project is based on the awesome [joseluisq/preact-starter project](https://github.com/joseluisq/preact-starter)

## Building

```sh
$ npm install # (you might use npm ci if you use an up-to-date npm)
$ npm run build
```

- Afterwards, a bundle should be produced in `dist` which you can use in a docker image etc.

## Development

```sh
$ npm install # (you might use npm ci)
$ npm run start
```

This will launch the standard webpack-dev-server.

## Deployment

Build a version with your endpoint in your env variables.

```sh
$ ENDPOINT="wss://test.foo.bar" npm run build
```