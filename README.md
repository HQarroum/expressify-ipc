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

The below example shows you how to create an instance of an Expressify client using the `ipc` strategy.

```js
// Creating the `client` instance.
const client = new Expressify.Client({
  strategy: new IpcStrategy({
    endpoint: 'expressify.server',
    namespace: 'foo'
  })
});
```

### Creating a server

The below example shows you how to create an instance of an Expressify server using the `ipc` strategy.

```js
// Creating the `server` instance.
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

### Closing `expressify-ipc`

Since the `expressify-ipc` module uses IPC local socket communication, it is required to make sure that, when done using the server or the client, you properly release the resources that have been allocated to them.

### Closing the server

Here, you simply have to call the `.close()` API on the server instance as you would usually do it with any expressify strategy. THis will close the local socket on which the strategy is communicating.

```js
server.close().then(() => console.log('Server instance closed'));
```

### Closing the client

When done with a client instance, you need to explicitely close it using the `.close()` API on the client instance.

```js
client.close().then(() => console.log('Client instance closed'));
```

> If you do not close the client on Node.js, the event loop will continue running since the local socket associated with the strategy which the client is using is still opened.

## Examples

Two functional examples involving the `expressify-ipc` strategy are available in the [examples](./examples) directory :

 - [Remote storage](https://github.com/HQarroum/expressify-ipc/tree/master/examples/remote-storage) - Demonstrates how to use `expressify-ipc` to expose a REST interface on the server which can store in memory a set of key-value pairs, and on the client on how to query this service remotely over local sockets.
 - [System monitoring](https://github.com/HQarroum/expressify-ipc/tree/master/examples/system-monitoring) - Shows you how to use `expressify-ipc` to expose system metrics on the server and to display them to the user on the client.

## See also

 - The [Expressify](https://github.com/HQarroum/expressify) framework.
 - The [expressify-mqtt](https://github.com/HQarroum/expressify-mqtt) strategy supporting MQTT(S) connections as a transport.
 - The [expressify-pm](https://github.com/HQarroum/expressify-pm) strategy supporting [`.postMessage`](https://developer.mozilla.org/fr/docs/Web/API/Window/postMessage).
