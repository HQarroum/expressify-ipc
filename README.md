<p align="center">
  <img width="300" src="assets/logo.png" />
</p>

# expressify-ipc
> An Expressify strategy enabling RESTful application over a local socket transport.

[![Build Status](https://travis-ci.org/HQarroum/expressify-ipc.svg?branch=master)](https://travis-ci.org/HQarroum/expressify-ipc)
[![Code Climate](https://codeclimate.com/github/HQarroum/expressify-ipc/badges/gpa.svg)](https://codeclimate.com/github/HQarroum/expressify-ipc)

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
 - Uses Unix or Windows local sockets for faster communication.
 - Supports observation of resources through local sockets.

## Usage

In order to use `expressify-ipc`, you need to create an instance of the strategy and pass it to an expressify client or server. You must pass to the constructor of this strategy an optional `namespace` variable which is used on Unix to partition Unix sockets, as well as an `endpoint` which uniquely identifies the server.

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

> If the namespace is not set, the Unix Domain Socket will combine the socket root, appspace, and id to form the Unix Socket Path for creation or binding

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
