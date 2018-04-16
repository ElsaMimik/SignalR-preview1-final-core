/*
 * JavaScript and TypeScript clients for SignalR for ASP.NET Core
 * library for signalr Dependents signalr.js -version preview1-1.0.0
 * 2018-04-16
 * 
 * @ HiggsSignalR.mulRegist
 * @ HiggsSignalR.start
 * @ HiggsSignalR.invoke
 * @ HiggsSignalR.stop
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
    // (1)
    connHub.connection.onclose = e => {
      console.log('disconnected', e)
      // (2)
      this.retry()
    }
    return this.connections
  },
  // 300ms檢查一次 | check status === 3 才retry
  // 手動關閉的設定一個flag不要檢查上面那個條件
  // (3)
  async retry() {
    console.log('retry')
    // ......
  },
  // var testMethod = () => {console.log('12345678910')}
  // HiggsSignalR.resetOn(`http://${document.location.host}/chathub?accessToken=123`,'SendMsgConsole',testMethod)
  // remove and add (4)
  async resetOn(hub, method, callback) {
    var conn = this.connections.find(s => s.connection.baseUrl === hub)
    conn.methods.delete(method.toLowerCase()) ////(1)off method
    conn.on(method, callback)
  },
  // connecting the server to the signalr hub
  async start(hub, callback, error) {
    var conn = this.connections.find(s => s.connection.baseUrl === hub)
    conn
      .start()
      .then(result => {
        console.log('start' + (result === null || !result ? '' : ' :' + result))
        callback()
      })
      .catch(err => {
        console.log(err)
        error()
      })
    return this.connections
  },
  async invoke(hub, method, ...args) {
    var conn = this.connections.find(s => s.connection.baseUrl === hub)
    var argsArray = Array.prototype.slice.call(arguments)
    conn.invoke
      .apply(conn, argsArray.slice(1))
      .then(result => {
        console.log(
          'invocation completed successfully' +
            (result === null || !result ? '' : ' :' + result)
        )
      })
      .catch(err => {
        console.log(err)
      })
    return this.connections
  },
  // (1)
  async stop(hub, callback, error) {
    var conn = this.connections.find(s => s.connection.baseUrl === hub)
    conn
      .stop()
      .then(result => {
        console.log('stop' + (result === null || !result ? '' : ' :' + result))
        callback()
      })
      .catch(err => {
        console.log(err)
        error()
      })
    return this.connections
  }
}
/*******************************/
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
    console.log('ShowLog 2018-04-16')
  }
  HiggsSignalR.start(
    `http://${document.location.host}/chathub?accessToken=123`,
    ShowLog,
    ShowLog
  )
}
function testInvokeJoinGroup() {
  HiggsSignalR.invoke(
    `http://${document.location.host}/chathub?accessToken=123`,
    'JoinGroup',
    'Group01'
  )
  return ''
}
function testInvokeSendToGroup() {
  HiggsSignalR.invoke(
    `http://${document.location.host}/chathub?accessToken=123`,
    'SendToGroup',
    'Group01',
    'Hello'
  )
  return ''
}
function testStop() {
  var ShowLog = () => {
    console.log('ShowLog')
  }
  HiggsSignalR.stop(
    `http://${document.location.host}/chathub?accessToken=123`,
    ShowLog
  )
  return ''
}
