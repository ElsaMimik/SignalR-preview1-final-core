/*
 * JavaScript and TypeScript clients for SignalR for ASP.NET Core
 * library for signalr Dependents signalr.js -version preview1-1.0.0
 * 2018-04-16
 * @
 */
const HiggsSignalR = {
  transport: signalR.TransportType.WebSockets,
  connections: [],
  registClass: class {
    constructor(method, callback /*, msg*/) {
      this.method = method
      this.callback = callback
      // this.msg = msg
    }
  },
  getConnectionHub(connectionHub) {
    return this.connections.find(
      s => s.connection.baseUrl === connectionHub.connection.baseUrl
    )
  },
  addConnectionHub(connectionHub) {
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
  // HiggsSignalR.regist(`http://${document.location.host}/chathub?accessToken=123`,'testmethod',t)
  async regist(hub, method, callback) {
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
  async mulRegist(hub, ...regArg) {
    var isExist = this.connections.find(s => s.connection.baseUrl === hub)
    var connHub =
      isExist ||
      new signalR.HubConnection(hub, {
        transport: this.transport
      })
    this.addConnectionHub(connHub)
    var argsArray = Array.prototype.slice.call(arguments).slice(1)
    for (let element of argsArray) {
      connHub.on(element.method, element.callback)
    }
    return this.connections
  },
  // connecting the server to the signalr hub
  start(hub, callback, error) {
    var conn = this.connections.find(s => s.connection.baseUrl === hub)
    conn
      .start()
      .then(() => {
        callback()
      })
      .catch(err => {
        console.log(err)
        error()
      })
  },
  stop(hub, callback, error) {
    var conn = this.connections.find(s => s.connection.baseUrl === hub)
    conn
      .stop()
      .then(() => {
        callback()
      })
      .catch(err => {
        console.log(err)
        error()
      })
    console.log('left')
  },
  invoke(hub, method, ...args) {
    var conn = this.connections.find(s => s.connection.baseUrl === hub)
    var argsArray = Array.prototype.slice.call(arguments)
    conn.invoke
      .apply(conn, argsArray.slice(1))
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
        console.log(err)
        addLine('message-list', err, 'red')
      })
  }
}

function test() {
  var GetMsg = msg => {
    console.log('SendMsgConsole', msg)
    addLine('message-list', msg)
  }
  var SendMsgConsole = msg => {
    console.log('GetMsg', msg)
    addLine('message-list', msg)
  }
  HiggsSignalR.mulRegist(
    `http://${document.location.host}/chathub?accessToken=123`,
    new HiggsSignalR.registClass('GetMsg', GetMsg),
    new HiggsSignalR.registClass('SendMsgConsole', SendMsgConsole)
  )

  var ShowLog = () => {
    console.log('ShowLog')
  }
  HiggsSignalR.start(
    `http://${document.location.host}/chathub?accessToken=123`,
    ShowLog,
    ShowLog
  )
}
function testStop() {
  var ShowLog = () => {
    console.log('ShowLog')
  }
  HiggsSignalR.stop(
    `http://${document.location.host}/chathub?accessToken=123`,
    ShowLog,
    ShowLog
  )
}
