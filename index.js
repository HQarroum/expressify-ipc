const EventEmitter = require('events').EventEmitter;
const ipc = require('node-ipc');
const Cache = require('timed-cache');

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
 * @return a string representation of a randomly
 * created GUID.
 */
const guid = () => {
  const s4 = function () {
    return Math.floor((1 + Math.random()) * 0x10000)
      .toString(16)
      .substring(1);
  };
  return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
    s4() + '-' + s4() + s4() + s4();
};

/**
 * Called back when a new inbound message has
 * been received.
 */
const onServerMessage = function (data) {
  try {
    //console.log('server response', data);
    this.emit('message', { data });
  } catch (e) {}
};

/**
 * Called back when a new inbound message has
 * been received.
 */
const onClientMessage = function (data, socket) {
  try {
    //console.log('client message', data);
    this.clients[data.transactionId] = socket;
    this.emit('message', { data });
  } catch (e) {}
};

/**
 * Registers a new subscription.
 * @param {*} resource the resource to associate with
 * the new subscription.
 */
const register = function (resource) {
  // Creating subscription for the resource.
  if (!this.subscribers[resource]) {
    return (this.subscribers[resource] = { count: 1, connection: this });
  }
  // Incrementing the reference counter on the number of
  // subscribers for `resource`.
  return (this.subscribers[resource].count++);
};

const removeSubscription = function (resource) {
  // Removing the subscription timer.
  this.eventCache.remove(resource);
  // Removing the subscription from memory.
  delete this.subscribers[resource];
};

/**
 * Decrements the reference counter associated with
 * the given subscription.
 * @param {*} resource the resource associated with
 * the subscription to dereference.
 * @return whether the `unregister` operation has suceeded.
 */
const unregister = function (resource) {
  if (!this.subscribers[resource]) return (false);
  // Dereferencing a subscriber.
  if (!(--this.subscribers[resource].count)) {
    // If the reference counter reached zero, we remove the
    // subscription.
    removeSubscription.call(this, resource);
  }
  return (true);
};

/**
 * Connects to the remote server endpoint.
 * @return a promise resolved when the connection
 * has been established.
 */
const connect = function () {
  return new Promise((resolve) => ipc.connectTo(this.opts.endpoint, () => {
    (this.server = ipc.of[this.opts.endpoint]).once('connect', () => {
      this.server.on(this.opts.namespace, this.onServerMessage);
      resolve();
    }).once('disconnect', () => {
      console.log('disconnected');
    });
  }));
};

/**
 * The MQTT strategy class allows to carry
 * expressify messages over an MQTT transport.
 */
class Strategy extends EventEmitter {

  /**
   * MQTT strategy constructor.
   * @param {*} opts the configuration object to be used.
   */
  constructor(opts) {
    super();
    enforceOptions(opts);
    this.opts = opts || {};
    this.clients = {};
    this.subscribers = {};
    this.timeout = this.opts.timeout || (10 * 1000);
    this.cache = new Cache({ defaultTtl: this.timeout });
    this.onClientMessage = onClientMessage.bind(this);
    this.onServerMessage = onServerMessage.bind(this);
    ipc.config.silent = typeof this.opts.debug !== 'undefined' ? this.opts.debug : true;
  }

  /**
   * Publishes a message on a request topic.
   * @param {*} object the expressify payload to publish.
   */
  publish(object) {
    let p_ = Promise.resolve();
    if (object.type === 'request') {
      if (!this.server) {
        // Creating the initial client socket.
        p_ = p_.then(() => connect.call(this));
      }
      return (p_ = p_.then(() => this.server.emit(this.opts.namespace, object)));
    } else if (object.type === 'response') {
      const socket = this.clients[object.transactionId];
      if (!socket) {
        return (Promise.reject('The request `transactionId` is invalid'));
      }
      delete this.clients[object.transactionId];
      return (p_ = p_.then(() => ipc.server.emit(socket, this.opts.namespace, object)));
    } else if (object.type === 'event') {
      
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
    const topic = req.resource;
    // Registering the subscription.
    register.call(this, topic);
    // Replying a succeeded operation.
    res.send({ topic });
  }

  /**
   * Removes an existing subscription on the resource expressed on the
   * given request object.
   * @param {*} req the expressify request.
   * @param {*} res the expressify response.
   */
  unsubscribe(req, res) {
    const topic = req.resource;
    // Removing the subscription if it exists.
    if (!unregister.call(this, topic)) {
      return res.send(404, { error: 'No such subscription' });
    }
    // Replying a succeeded operation.
    res.send({ topic });
  }

  /**
   * Called back on a `ping` request.
   * @param {*} req the expressify request.
   * @param {*} res the expressify response.
   */
  ping(req, res) {
    // Re-arming timers associated with the given resources.
    if (Array.isArray(req.payload.resources)) {
      req.payload.resources.forEach((r) => reArm.call(this, r));
    }
    // Replying a succeeded operation.
    res.send(200);
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
    ipc.server.stop();
    return (Promise.resolve());
  }
};

module.exports = Strategy;