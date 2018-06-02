const Expressify  = require('expressify-js');
const IpcStrategy = require('../../');

/**
 * The memory store.
 */
const store = {};

/**
 * Creating the Expressify server.
 */
const server = new Expressify.Server({
  strategy: new IpcStrategy({
    endpoint: 'remote.storage.server',
    namespace: 'foo'
  })
});

/**
 * Request logging middleware.
 */
server.use((req, res, next) => {
  console.log(`[*] Got a '${req.method}' request on '${req.resource}' with payload '${JSON.stringify(req.payload)}'`);
  next();
});

/**
 * Reads an object from the store.
 */
server.get('/store/:key', (req, res) => {
  const object = store[req.params.key];
  res.send(object ? 200 : 404, object || 'Not found');
});

/**
 * Writes an object to the store.
 */
server.post('/store/:key', (req, res) => {
  if (!req.params.key || !req.payload) {
    return (res.send(400));
  }
  store[req.params.key] = req.payload;
  res.send(200);
});

/**
 * Listening for incoming requests.
 */
server.listen().then(() => {
  console.log(`[+] The server is listening for incoming requests on namespace '${server.strategy.opts.namespace}' !`);
});

/**
 * Closing the server when a `SIGINT` is received.
 */
process.on('SIGINT', () => {
  server.close().then(process.exit);
});