<p align="center">
  <img src="assets/logo.png" />
</p>

# expressify-ipc
> An Expressify strategy enabling RESTful application over a local socket transport.

[![Build Status](https://travis-ci.org/HQarroum/expressify-mqtt.svg?branch=master)](https://travis-ci.org/HQarroum/expressify-mqtt)
[![Code Climate](https://codeclimate.com/github/HQarroum/expressify-mqtt/badges/gpa.svg)](https://codeclimate.com/github/HQarroum/expressify-mqtt)

Current version: **1.0.0**

Lead Maintainer: [Halim Qarroum](mailto:hqm.post@gmail.com)

## Table of contents

- [Installation](#installation)
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
 - 

## Usage

In order to use `expressify-ipc`, you need to create an instance of the strategy and pass it to an expressify client or server. You can pass to the constructor of this strategy an optional `namespace` variable which is used on Unix to partition Unix sockets in case you have multiple instances of an application running.

### Creating a client

```js
// Injecting the `mqtt.js` library.
const mqtt = require('mqtt');

// Creating the client instance.
const client = new Expressify.Client({
  strategy: new IpcStrategy({ namespace: 'foo' })
});
```

> If the namespace is not set, the Unix Domain Socket will combine the socket root, appspace, and id to form the Unix Socket Path for creation or binding

### Creating a server

```js
// Injecting the `mqtt.js` library.
const mqtt = require('mqtt');

// Creating the server instance.
const server = new Expressify.Server({
  strategy: new IpcStrategy({ mqtt, topic: 'foo' })
});

// Listening for incoming requests.
server.listen().then(() => {
  console.log(`[+] The server is listening on mount point '${server.strategy.opts.topic}' !`);
});
```

## Examples

Different functional examples involving the `expressify-ipc` strategy are available in the [examples](./examples) directory. Every examples comes with a `README.md` file detailing the use-case and the usage of the example in question.

## See also

 - The [Expressify](https://github.com/HQarroum/expressify) framework.
 - The [expressify-mqtt](https://github.com/HQarroum/expressify-mqtt) strategy supporting MQTT(S) connections as a transport.
 - The [expressify-pm](https://github.com/HQarroum/expressify-pm) strategy supporting [`.postMessage`](https://developer.mozilla.org/fr/docs/Web/API/Window/postMessage).
