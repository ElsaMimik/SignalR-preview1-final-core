/*
 * JavaScript and TypeScript clients for SignalR for ASP.NET Core
 * library for signalr Dependents signalr.js -version preview1-1.0.0
 * 2018-04-16
 * @
*/
var transport = signalR.TransportType.WebSockets
var connections = []
var connection = class {
  constructor(status, hub) {
    this.status = status
    this.hub = hub
  }
}

function getConnectionHub(connectionHub) {
  return connections.find(s => s.hub == connectionHub)
}

function addConnectionHub(connectionHub) {
  var conn = getConnectionHub(connectionHub)
  if (conn) {
    if (!conn.status) {
      connections.splice(connections.findIndex(s => s.hub === connectionHub), 1)
      connections.push(new connection(true, connectionHub))
    }
  } else {
    connections.push(new connection(true, connectionHub))
  }
}

//regist
function regist(hub, method, callback) {
  var connHub = new signalR.HubConnection(hub, { transport: transport })
  connHub.on(method, msg => {
    callback()
  })
}

//connecting the server to the signalr hub
function start(hub) {
  //
  connection
    .start()
    .then(() => {
      console.log('start')
      isConnected = true
      addLine('message-list', 'Connected successfully', 'green')
    })
    .catch(err => {
      addLine('message-list', err, 'red')
    })
}

//connecting the server to the signalr hub
function stop(hub) {
  //
  connection
    .stop()
    .then(() => {
      console.log('stop')
      isConnected = false
    })
    .catch(err => {
      addLine('message-list', err, 'red')
    })
}

function retry(hub) {
  //reconnect
}

//connecting the server to the signalr hub
function invoke(connection, method, ...args) {
  if (!isConnected) {
    return
  }
  var argsArray = Array.prototype.slice.call(arguments)
  connection.invoke
    .apply(connection, argsArray.slice(1))
    .then(result => {
      console.log(
        'invocation completed successfully: ' +
          (result === null ? '(null)' : result)
      )
      if (result) {
        addLine('message-list', result)
      }
    })
    .catch(err => {
      addLine('message-list', err, 'red')
    })
}
