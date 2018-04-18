/*
 * JavaScript and TypeScript clients for SignalR for ASP.NET Core
 * library for signalr Dependents signalr.js -version preview1-1.0.0
 * 2018-04-16
 * 
 * @ HiggsSignalR.mulRegister
 * @ HiggsSignalR.start
 * @ HiggsSignalR.invoke
 * @ HiggsSignalR.stop
 */
const ConnectionStatus = Object.freeze({
  Connected: 1,
  Disconnected: 2,
  Error: 3
})
const HiggsSignalR = {
  transport: signalR.TransportType.WebSockets,
  // connections: [],
  connStatus: [],
  connStatusClass: class {
    constructor(hub, retryTimes, isStop, callback, error) {
      this.hub = hub
      this.retryTimes = retryTimes
      this.isStop = isStop
      this.callback = callback
      this.error = error
    }
  },
  registerClass: class {
    constructor(method, callback /*, msg*/) {
      this.method = method
      this.callback = callback
      // this.msg = msg
    }
  },
  // getConnectionHub(connectionHub) {
  //   return this.connections.find(
  //     s => s.connection.baseUrl === connectionHub.connection.baseUrl
  //   )
  // },
  getConnStatus(hubBaseUrl) {
    return this.connStatus.find(
      s => s.hub.connection.baseUrl === hubBaseUrl.connection.baseUrl
    )
  },
  addConnectionHub(connectionHub) {
    var conn = this.getConnStatus(connectionHub)
    if (conn) {
      if (conn.hub.connection.connectionState !== ConnectionStatus.Connected) {
        this.connStatus.splice(
          this.connStatus.findIndex(
            s => s.hub.connection.baseUrl === connectionHub
          ),
          1
        )
        // this.connections.push(connectionHub)
        this.connStatus.push(new this.connStatusClass(connectionHub, 0, false))
      }
    } else {
      // this.connections.push(connectionHub)
      this.connStatus.push(new this.connStatusClass(connectionHub, 0, false))
    }
  },
  // register
  // var t = () => {console.log('aaaa')}
  // HiggsSignalR.register(`http://${document.location.host}/chathub?accessToken=123`,'testmethod',t)
  async register(hub, method, callback) {
    var isExist = this.connStatus.find(s => s.hub.connection.baseUrl === hub)
    var connHub =
      isExist ||
      new signalR.HubConnection(hub, {
        transport: this.transport
      })
    this.addConnectionHub(connHub)
    connHub.hub.on(method, msg => {
      callback()
    })
    // return this.connStatus.hub
  },
  async mulRegister(hub, ...regArg) {
    var isExist = this.connStatus.find(s => s.hub.connection.baseUrl === hub)
    isExist = isExist ? isExist.hub : isExist
    var connHub =
      isExist ||
      new signalR.HubConnection(hub, {
        transport: this.transport
      })
    this.addConnectionHub(connHub)
    var argsArray = Array.prototype.slice.call(arguments).slice(1)
    for (let element of argsArray) {
      // 如果已存在該method則刪除再加入
      // 否則會造成合併method內容
      if (!isExist) connHub.on(element.method, element.callback)
      else
        this.resetOn(
          isExist.connection.baseUrl,
          element.method,
          element.callback
        )
    }
    // (1) 斷線時connHub
    connHub.connection.onclose = e => {
      console.log('disconnected', e)
      // (2)
      var isExist = this.connStatus.find(
        s => s.hub.connection.baseUrl === connHub.connection.baseUrl
      )
      if (isExist) {
        // 不是人為關閉的情況
        if (
          !isExist.isStop &&
          isExist.hub.connection.connectionState !== ConnectionStatus.Connected
        ) {
          this.retry(connHub)
        }
      }
    }
    // return this.connStatus.hub
  },
  // 300ms檢查一次 | check status === 3 才retry
  // Connecting = 0 ; Connected = 1 ; Disconnected = 2 新的
  // onnecting: 0, connected: 1, reconnecting: 2, disconnected: 4 舊的
  // 手動關閉的設定一個flag不要檢查上面那個條件
  // (3)
  async retry(connHub) {
    console.log('connHub', connHub)
    console.log('retry')
    var conn = this.connStatus.find(
      s => s.hub.connection.baseUrl === connHub.connection.baseUrl
    )
    //setTimer
    while (
      conn.retryTimes < 4 &&
      conn.hub.connection.connectionState !== ConnectionStatus.Connected
    ) {
      conn.retryTimes += 1 //三次為限，間隔300ms
      let times = conn.retryTimes
      setTimeout(() => {
        // ......
        console.log('conn.retryTimes' + times)
        this.start(connHub)
      }, 300 * conn.retryTimes)
    }
  },
  // var testMethod = () => {console.log('12345678910')}
  // HiggsSignalR.resetOn(`http://${document.location.host}/chathub?accessToken=123`,'SendMsgConsole',testMethod)
  // remove and add (4)
  async resetOn(hub, method, callback) {
    var conn = this.connStatus.find(s => s.hub.connection.baseUrl === hub)
    conn.hub.methods.delete(method.toLowerCase()) ////(1)off method
    conn.hub.on(method, callback)
  },
  // connecting the server to the signalr hub
  async start(hub, callback, error) {
    var conn = this.connStatus.find(s => s.hub.connection.baseUrl === hub)
    // var _conn
    if (conn) {
      // _conn = conn.hub
    } else {
      conn = this.connStatus.find(
        s => s.hub.connection.baseUrl === hub.connection.baseUrl
      )
    }
    if (!conn.callback || callback) {
      conn.callback = callback
    }
    if (!conn.error || error) {
      conn.error = error
    }
    conn.hub
      .start()
      .then(result => {
        console.log('start' + (result === null || !result ? '' : ' :' + result))
        callback ? callback() : conn.callback()
      })
      .catch(err => {
        console.log(err)
        error ? error() : conn.error()
      })
    // return this.connStatus.hub
  },
  async invoke(hub, method, ...args) {
    var conn = this.connStatus.find(s => s.hub.connection.baseUrl === hub)
    var argsArray = Array.prototype.slice.call(arguments)
    conn.hub.invoke
      .apply(conn.hub, argsArray.slice(1))
      .then(result => {
        console.log(
          'invocation completed successfully' +
            (result === null || !result ? '' : ' :' + result)
        )
      })
      .catch(err => {
        console.log(err)
      })
    // return this.connStatus.hub
  },
  // (1)
  async stop(hub, callback, error) {
    var conn = this.connStatus.find(s => s.hub.connection.baseUrl === hub)
    conn.isStop = true //手動關閉
    conn.hub
      .stop()
      .then(result => {
        console.log('stop' + (result === null || !result ? '' : ' :' + result))
        callback()
      })
      .catch(err => {
        console.log(err)
        error()
      })
    // return this.connStatus.hub
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
  HiggsSignalR.mulRegister(
    `http://${document.location.host}/chathub?accessToken=123`,
    new HiggsSignalR.registerClass('GetMsg', GetMsg),
    new HiggsSignalR.registerClass('SendMsgConsole', SendMsgConsole)
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
  // return ''
}
function testInvokeSendToGroup() {
  HiggsSignalR.invoke(
    `http://${document.location.host}/chathub?accessToken=123`,
    'SendToGroup',
    'Group01',
    'Hello'
  )
  // return ''
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
  // return ''
}
