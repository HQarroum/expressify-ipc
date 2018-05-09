const EventEmitter = require('events').EventEmitter;
const ipc = require('node-ipc');

/**
 * Throws an exception if the given `opts` object
 * is invalid.
 */
const enforceOptions = (opts) => {
  if (!opts || !opts.endpoint || !opts.namespace) {
    throw new Error('A reference to a `namespace` and an `endpoint` to use are required')
  }
};

/**
 * Called back when a new inbound message has
 * been received from a remote server.
 */
const onServerMessage = function (data) {
  this.emit('message', { data });
};

/**
 * Called back when a new inbound message has
 * been received from a remote client.
 */
const onClientMessage = function (data, socket) {
  // Saving the transaction identifier.
  this.clients[data.transactionId] = socket;
  this.emit('message', { data });
};

/**
 * Connects to the remote server endpoint.
 * @return a promise resolved when the connection
 * has been established.
 */
const connect = function () {
  let server = ipc.of[this.opts.endpoint];
  // Checking whether a connection already exists, or
  // establishing a new connection otherwise.
  return (server ? Promise.resolve(server) : new Promise((resolve, reject) =>
    ipc.connectTo(this.opts.endpoint, () => {
      (server = ipc.of[this.opts.endpoint]).on('connect', () => {
        // Subscribing to namespace events.
        server.on(this.opts.namespace, this.onServerMessage);
        resolve(server);
      })
      .on('disconnect', () => server.off(this.opts.namespace, this.onServerMessage))
      .on('error', reject);
  })));
};

/**
 * Sends the given `request` to the currently connected
 * server.
 * @param {*} request the request to send.
 */
const query = function (request) {
  return this.queue = this.queue
    .then(() => connect.call(this))
    .then((server) => server.emit(this.opts.namespace, request));
};

/**
 * Sends the given `response` to the initiating
 * client.
 * @param {*} response the response to send.
 */
const reply = function (response) {
  const socket = this.clients[response.transactionId];

  if (!socket) {
    // The socket could not be found.
    return (Promise.reject('The request `transactionId` is invalid'));
  }
  // Removing the socket from the cache.
  delete this.clients[response.transactionId];
  // Replying to the client.
  ipc.server.emit(socket, this.opts.namespace, response);
  return (Promise.resolve());
};

/**
 * Notifies an array of subscribers currently observing
 * the resource associated with the given `event`.
 * @param {*} event the event to dispatch.
 */
const notify = function (event) {
  return (Promise.resolve(
    ipc.server.broadcast(this.opts.namespace, event)
  ));
};

/**
 * The IPC strategy class allows to carry
 * expressify messages over an IPC transport.
 */
class Strategy extends EventEmitter {

  /**
   * IPC strategy constructor.
   * @param {*} opts the configuration object to be used.
   */
  constructor(opts) {
    super();
    enforceOptions(opts);
    this.opts = opts || {};
    this.clients = {};
    this.queue = Promise.resolve();
    this.subscribers = {};
    this.onClientMessage = onClientMessage.bind(this);
    this.onServerMessage = onServerMessage.bind(this);
    // Listening to `ping` requests.
    this.on('ping', (o) => o.res.send(200));
    // Removing `ipc` logs.
    ipc.config.silent = typeof this.opts.debug !== 'undefined' ? this.opts.debug : true;
  }

  /**
   * Publishes a message on a request topic.
   * @param {*} object the expressify payload to publish.
   */
  publish(object) {
    if (object.type === 'request') {
      return (query.call(this, object));
    } else if (object.type === 'response') {
      return (reply.call(this, object));
    } else if (object.type === 'event') {
      return (notify.call(this, object));
    }
    return (Promise.reject('Invalid request type'));
  }

  /**
   * Creates a subscription on the resource expressed on the
   * given request object.
   * @param {*} req the expressify request.
   * @param {*} res the expressify response.
   */
  subscribe(req, res) {
    // Replying with a success response.
    res.send({ topic: req.resource });
  }

  /**
   * Removes an existing subscription on the resource expressed on the
   * given request object.
   * @param {*} req the expressify request.
   * @param {*} res the expressify response.
   */
  unsubscribe(req, res) {
    // Replying with a success response.
    res.send({ topic: req.resource });
  }

  /**
   * Starts listening for incoming message on the local socket
   * associated with the specified namespace in the class
   * configuration object.
   * @return a promise resolved when the listening operation
   * has been completed.
   */
  listen() {
    return new Promise((resolve, reject) => {
      ipc.config.id = this.opts.endpoint;
      ipc.serve(() => {
        ipc.server.on(this.opts.namespace, this.onClientMessage);
        resolve();
      });
      ipc.server.start();
    });
  }

  /**
   * Stops listening for incoming message on the local socket
   * associated with the specified namespace in the class
   * configuration object.
   * @return a promise resolved when the closing operation
   * has been completed.
   */
  close() {
    return (Promise.resolve(
      ipc.server.stop()
    ));
  }
};

module.exports = Strategy;