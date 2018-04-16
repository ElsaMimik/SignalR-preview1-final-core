/*
 * JavaScript and TypeScript clients for SignalR for ASP.NET Core
 * library for signalr Dependents signalr.js -version preview1-1.0.0
 * 2018-04-16
 * @
 */
var HiggsSignalR = HiggsSignalR || {}
HiggsSignalR = {
  transport: signalR.TransportType.WebSockets,
  connections: [],
  registClass: class {
    constructor(method, callback) {
      this.method = method
      this.callback = callback
    }
  },
  getConnectionHub: function(connectionHub) {
    return this.connections.find(
      s => s.connection.baseUrl === connectionHub.connection.baseUrl
    )
  },
  addConnectionHub: function(connectionHub) {
    var conn = this.getConnectionHub(connectionHub)
    if (conn) {
      if (conn.connection.connectionState !== 1) {
        this.connections.splice(
          this.connections.findIndex(
            s => s.connection.baseUrl === connectionHub
          ),
          1
        )
        this.connections.push(connectionHub)
      }
    } else {
      this.connections.push(connectionHub)
    }
  },
  // regist
  // var t = () => {console.log('aaaa')}
  // HiggsSignalR.regist('http://localhost:51100/chathub','testmethod',t)
  regist: async function(hub, method, callback) {
    var isExist = this.connections.find(s => s.connection.baseUrl === hub)
    var connHub =
      isExist ||
      new signalR.HubConnection(hub, {
        transport: this.transport
      })
    this.addConnectionHub(connHub)
    connHub.on(method, msg => {
      callback()
    })
    return this.connections
  },
  //   var t = () => {console.log('aaaa')}
  //   var methods = []
  //   methods.push(new HiggsSignalR.registClass('testmethod01',t))
  //   methods.push(new HiggsSignalR.registClass('testmethod02',t))
  //   HiggsSignalR.mulRegist('http://localhost:51100/chathub',methods)
  mulRegist: async function(hub, ...regArg) {
    var isExist = this.connections.find(s => s.connection.baseUrl === hub)
    var connHub =
      isExist ||
      new signalR.HubConnection(hub, {
        transport: this.transport
      })
    this.addConnectionHub(connHub)
    var argsArray = Array.prototype.slice.call(arguments).slice(1)[0]
    for (let element of argsArray) {
      connHub.on(element.method, msg => {
        element.callback()
      })
    }
    return this.connections
  }
  ////connecting the server to the signalr hub
  //start: function () {
  //    connection
  //        .start()
  //        .then(() => {
  //            console.log('start')
  //            isConnected = true
  //            addLine('message-list', 'Connected successfully', 'green')
  //        })
  //        .catch(err => {
  //            addLine('message-list', err, 'red')
  //        })
  //},
  ////connecting the server to the signalr hub
  //stop: function () {
  //    connection
  //        .stop()
  //        .then(() => {
  //            console.log('stop')
  //            isConnected = false
  //        })
  //        .catch(err => {
  //            addLine('message-list', err, 'red')
  //        })
  //},
  //retry: function () {
  //    //reconnect
  //},
  ////connecting the server to the signalr hub
  //invoke: function () {
  //    if (!isConnected) {
  //        return
  //    }
  //    var argsArray = Array.prototype.slice.call(arguments)
  //    connection.invoke
  //        .apply(connection, argsArray.slice(1))
  //        .then(result => {
  //            console.log(
  //                'invocation completed successfully: ' +
  //                (result === null ? '(null)' : result)
  //            )
  //            if (result) {
  //                addLine('message-list', result)
  //            }
  //        })
  //        .catch(err => {
  //            addLine('message-list', err, 'red')
  //        })
  //},
}
