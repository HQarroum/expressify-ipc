const program = require('commander');
const Expressify = require('expressify-js');
const IpcStrategy = require('../../');
const dump = require('./lib/dump');

/**
 * Application command-line interface.
 */
program
  .version('1.0.0')
  .option('-l, --live', 'Whether to observe remote resources and refresh them in live')
  .parse(process.argv);

/**
 * Resources monitored by this client. Caches the
 * values associated with responses associated with
 * each resources.
 */
const resources = {
  '/system/cpu': {},
  '/system/memory': {},
  '/system/os': {},
  '/system/network': {},
  '/system/processes': {},
  '/system/storage': {}
};

/**
 * Creating the Expressify client.
 */
const client = new Expressify.Client({
  strategy: new IpcStrategy({
    endpoint: 'monitoring.server',
    namespace: 'system'
  })
});

/**
 * Called back when an event associated with a 
 * given resource has been received from a server.
 * @param {*} e the received event.
 */
const onEvent = (e) => {
  resources[e.resource] = e.payload;
  console.log('\033[2J');
  refresh();
};

/**
 * Refreshes the screen with gathered information on
 * the remote host.
 */
const refresh = () => Object.keys(resources).forEach((k) => dump[k.split('/')[2]](resources[k]));

/**
 * Issues 3 different requests against the remote expressify
 * server :
 *  - Requests the CPU information of the host.
 *  - Requests the OS information of the host.
 *  - Requests the network information of the host.
 *  - Requests the processes information of the host.
 *  - Requests the storage information of the host.
 * @return a promise resolved when the requests have been executed, and
 * their associated responses have been received.
 */
const sendRequests = () => {

  /**
   * Requesting system information from the host associated
   * with the declared `resources`.
   */
  return Promise.all(
    Object.keys(resources).map((r) => client.get(r).then((res) => {
      const o = {};
      o[r] = res;
      return (o);
    })
  ))

  /**
   * Dumping gathered CPU information from the host.
   */
  .then((res) => {
    res.forEach((o) => {
      const key = Object.keys(o)[0];
      resources[key] = o[key].payload;
    });
    refresh();
  })
  
  /**
   * Handling query errors.
   */
  .catch((err) => {
    console.log(`[!] ${err}`);
    process.exit(-1);
  });
};

/**
 * Issuing the requests against the remote expressify server.
 */
sendRequests().then(() => {
  if (program.live) {
    // Subscribing to events.
    return Object.keys(resources).forEach((k) => client.subscribe(k, onEvent));
  } else {
    // Closing the client.
    client.close().then(process.exit);
  }
}).catch(console.error);

/**
 * Unsubscribing from current subscriptions, and closing the
 * IPC connection when leaving the application.
 */
process.on('SIGINT', () => {
  console.log('[+] Closing the IPC connection and unsubscribing from resources ...');

  /**
   * Unsubscribing from previously subscribes `resources`.
   */
  Promise.all(
    Object.keys(resources).map((k) => client.unsubscribe(k, onEvent))
  )

  /**
   * Releasing the resources allocated to the client.
   */
  .then(() => client.close())
  
  /**
   * Unsubscription is done, closing the connection.
   */
  .then(process.exit)

  /**
   * In case of an error, we also close the connection.
   */
  .catch(process.exit)
});