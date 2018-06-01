<p align="center">
  <img width="250" src="assets/logo.png" />
</p>

# expressify-ipc
> An Expressify strategy enabling RESTful application over a local socket transport.

[![CodeFactor](https://www.codefactor.io/repository/github/hqarroum/expressify-ipc/badge/master)](https://www.codefactor.io/repository/github/hqarroum/expressify-ipc/overview/master)

Current version: **1.0.0**

Lead Maintainer: [Halim Qarroum](mailto:hqm.post@gmail.com)

## Table of contents

- [Installation](#install)
- [Features](#features)
- [Usage](#usage)
- [Examples](#examples)
- [See also](#see-also)

## Install

```bash
npm install --save expressify-ipc
```

## Features

 - Supports Linux, MacOS and Windows.
 - Based on Unix or Windows local sockets for better throughput.
 - Supports observation of resources through local sockets.

## Usage

In order to use `expressify-ipc`, you need to create an instance of the strategy and pass it to an expressify client or server. You must pass to the constructor of `expressify-ipc` an options object containing two parameters :

 - **endpoint** (String) - Uniquely identifies the server endpoint to connect to.
 - **namespace** (String) - The namespace used to partition communucation on the local socket.

### Creating a client

```js
// Creating the client instance.
const client = new Expressify.Client({
  strategy: new IpcStrategy({
    endpoint: 'expressify.server',
    namespace: 'foo'
  })
});
```

### Creating a server

```js
// Creating the server instance.
const server = new Expressify.Server({
  strategy: new IpcStrategy({
    endpoint: 'expressify.server',
    namespace: 'foo'
  })
});

// Listening for incoming requests.
server.listen().then(() => {
  console.log(`[+] The server is listening on namespace '${server.strategy.opts.topic}' !`);
});
```

## Examples

Different functional examples involving the `expressify-ipc` strategy are available in the [examples](./examples) directory. Every examples comes with a `README.md` file detailing the use-case and the usage of the example in question.

## See also

 - The [Expressify](https://github.com/HQarroum/expressify) framework.
 - The [expressify-mqtt](https://github.com/HQarroum/expressify-mqtt) strategy supporting MQTT(S) connections as a transport.
 - The [expressify-pm](https://github.com/HQarroum/expressify-pm) strategy supporting [`.postMessage`](https://developer.mozilla.org/fr/docs/Web/API/Window/postMessage).
