const Expressify  = require('expressify-js');
const IpcStrategy = require('../../');

/**
 * Creating the Expressify client.
 */
const client = new Expressify.Client({
  strategy: new IpcStrategy({
    endpoint: 'remote.storage.server',
    namespace: 'foo'
  })
});

/**
 * Issues 3 different requests against the remote expressify
 * server :
 *  - Requests the description of the exposed resources by the server.
 *  - Stores an object at a given key on the remote server.
 *  - Reads the previously stored payload from the server.
 * @return a promise resolved when the requests have been executed, and
 * their associated responses have been received.
 */
const sendRequests = () => {

  /**
   * Requesting the description of resources exposed
   * by the remote server.
   */
  return client.describe().then((res) => console.log(`[+] ${JSON.stringify(res.payload)}`))
    
    /**
     * Writing a payload on the `/store/foo` resource.
     */
    .then((res) => client.post('/store/foo', { data: { foo: 'bar' }}))

    /**
     * Reading the payload written on the `/store/foo` resource.
     */
    .then((res) => client.get('/store/foo'))

    /**
     * Displaying the read payload.
     */
    .then((res) => console.log(`[+] Successfully wrote ${JSON.stringify(res.payload)} on the server`));
};

/**
 * Closes the client's underlying resources.
 */
const close = () => client.close().then(() => console.log('[+] Client properly closed'));

/**
 * Sending requests.
 */
sendRequests().then(() => {
  console.log('[+] Received 3/3 responses from the server !');
  return (close());
}).catch((err) => {
  console.error(`[!] ${err}`);
  return (close());
}).then(process.exit);
