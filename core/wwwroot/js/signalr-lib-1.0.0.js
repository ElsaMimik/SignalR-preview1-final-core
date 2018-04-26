/*
 * JavaScript and TypeScript clients for SignalR for ASP.NET Core
 * library for signalr Dependents signalr.js -version preview1-1.0.0
 * 2018-04-24
 * 
 * @ HiggsSignalR.mulRegister
 * @ HiggsSignalR.start
 * @ HiggsSignalR.invoke
 * @ HiggsSignalR.stop
 */

/**
  * 1.判斷有無websocket(OK)
  * 2.mulRegister改名register(OK)

  * 3.最外面變class，不要讓人家改，method封裝進物件(OK)
  * var a  = class { constructor() { this.abc = 1; } p() { this.abc++; console.log(this.abc); return this; } }
  * var b = new a()
  * b.p()

  * 4.大括號(OK)
  * property
  * https://www.w3schools.com/js/js_properties.asp

  * (5).enum放進去SetPrototypeOff()
  * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/setPrototypeOf

  * 6.forEach檢查(if ele instanceof class)(OK)
  * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/instanceof

  * 7.connStatus從[]改成{} --> (OK)
  * 這樣fine就可以直接用["keyWord"]
  * var abc = {}
  * abc['a'] = 1
  * abc.a->1

  * (8).method on的邏輯修改(hub不要重複就好，method改成點一點)

  * (9).測試method on的method名稱能否改成點一點
  * (10).呈上，能否關掉點一點後面的，而不會一起關掉

  * 11.呈3，包成class，就可以一直點下去(OK)

  * (12).enum包成yield Generator
  * https://developer.mozilla.org/zh-TW/docs/Web/JavaScript/Reference/Statements/function*
 **/

// const ConnectionStatus = Object.freeze({
//   Connected: 1,
//   Disconnected: 2,
//   Error: 3
// })
const HiggsSignalR = class {
  constructor() {
    this.transport = WebSocket ? signalR.TransportType.WebSockets : {}
    this.connections = {} //所有hub連線
    // connStatus = [] //移除
    this.ConnectionStatus = Object.freeze({
      Connected: 1,
      Disconnected: 2,
      Error: 3
    })
    this.connStatusClass = class {
      constructor(hub, retryTimes, isStop, callback, error) {
        this.hub = hub
        this.retryTimes = retryTimes
        this.isStop = isStop
        this.callback = callback
        this.error = error
      }
    }
    this.registerClass = class {
      constructor(method, callback /*, msg*/) {
        this.method = method
        this.callback = callback
        // this.msg = msg
      }
    }
  }
  async register(hub, ...regArg) {
    var hubData = this.connections[hub]
    // hubData = hubData? hubData.connection.baseUrl :
    // var isExist = this.connStatus.find(s => s.hub.connection.baseUrl === hub)
    // isExist = isExist ? isExist.hub : isExist
    var connHub =
      hubData /*isExist*/ ||
      new signalR.HubConnection(hub, {
        transport: this.transport
      })
    this.addConnectionHub(connHub)
    var argsArray = Array.prototype.slice.call(arguments).slice(1)
    for (let element of argsArray) {
      if (element instanceof this.registerClass) {
        if (!hubData) {
          // 如果已存在該連線，則刪除再加入
          // 否則會造成合併method內容
          connHub.on(element.method, element.callback)
        } else {
          this.resetOn(
            hubData.hub.connection.baseUrl,
            element.method,
            element.callback
          )
        }
      }
    }
    var onClose = hubData ? hubData.hub : connHub
    // (1) 斷線時connHub
    onClose.connection.onclose = e => {
      console.log('disconnected', e)
      // (2)
      // var isExist = this.connStatus.find(
      //   s => s.hub.connection.baseUrl === connHub.connection.baseUrl
      // )
      var hubData = this.connections[connHub.connection.baseUrl]
      if (hubData) {
        // 不是人為關閉的情況
        if (
          !hubData.isStop &&
          hubData.hub.connection.connectionState !== ConnectionStatus.Connected
        ) {
          this.retry(connHub)
        }
      }
    }
    // return this.connStatus.hub
  }
  async start(hub, callback, error) {
    // var conn = this.connStatus.find(s => s.hub.connection.baseUrl === hub)
    var conn = this.connections[hub]
    // var _conn
    if (conn) {
      // _conn = conn.hub
    } else {
      conn = this.connections[hub.connection.baseUrl]
      // conn = this.connStatus.find(
      //   s => s.hub.connection.baseUrl === hub.connection.baseUrl
      // )
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
  }
  // connecting the server to the signalr hub
  async invoke(hub, method, ...args) {
    var conn = this.connections[hub]
    // var conn = this.connStatus.find(s => s.hub.connection.baseUrl === hub)
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
  }
  // (1)
  async stop(hub, callback, error) {
    // var conn = this.connStatus.find(s => s.hub.connection.baseUrl === hub)
    var conn = this.connections[hub]
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
  // getConnectionHub(connectionHub) {
  //   return this.connections.find(
  //     s => s.connection.baseUrl === connectionHub.connection.baseUrl
  //   )
  // },
  getConnStatus(hubBaseUrl) {
    return this.connections[hubBaseUrl]
    // return this.connStatus.find(
    //   s => s.hub.connection.baseUrl === hubBaseUrl.connection.baseUrl
    // )
  }
  addConnectionHub(connectionHub) {
    var hubData = connectionHub.hub
      ? connectionHub.hub.connection.baseUrl
      : connectionHub.connection.baseUrl
    if (typeof this.connections[hubData] === 'undefined') {
      this.connections[
        connectionHub.connection.baseUrl
      ] = new this.connStatusClass(connectionHub, 0, false)
    }
    // var conn = this.getConnStatus(connectionHub)
    // if (conn) {
    //   if (conn.hub.connection.connectionState !== ConnectionStatus.Connected) {
    //     this.connStatus.splice(
    //       this.connStatus.findIndex(
    //         s => s.hub.connection.baseUrl === connectionHub
    //       ),
    //       1
    //     )
    //     // this.connections.push(connectionHub)
    //     this.connStatus.push(new this.connStatusClass(connectionHub, 0, false))
    //   }
    // } else {
    //   // this.connections.push(connectionHub)
    //   this.connStatus.push(new this.connStatusClass(connectionHub, 0, false))
    // }
  }
  // 300ms檢查一次 | check status === 3 才retry
  // Connecting = 0 ; Connected = 1 ; Disconnected = 2 新的
  // onnecting: 0, connected: 1, reconnecting: 2, disconnected: 4 舊的
  // 手動關閉的設定一個flag不要檢查上面那個條件
  // (3)
  async retry(connHub) {
    console.log('connHub', connHub)
    console.log('retry')
    var conn = this.connections[connHub.connection.baseUrl]
    // var conn = this.connStatus.find(
    //   s => s.hub.connection.baseUrl === connHub.connection.baseUrl
    // )
    //setTimer
    while (
      conn.retryTimes < 3 &&
      conn.hub.connection.connectionState !== ConnectionStatus.Connected
    ) {
      conn.retryTimes += 1 //三次為限，間隔300ms
      let times = conn.retryTimes
      setTimeout(() => {
        // ......
        console.log('conn.retryTimes' + times, connHub)
        this.start(connHub)
      }, 300 * conn.retryTimes)
    }
  }
  // var testMethod = () => {console.log('12345678910')}
  // HiggsSignalR.resetOn(`http://${document.location.host}/chathub?accessToken=123`,'SendMsgConsole',testMethod)
  // remove and add (4)
  async resetOn(hub, method, callback) {
    var conn = this.connections[hub]
    // var conn = this.connStatus.find(s => s.hub.connection.baseUrl === hub)
    conn.hub.methods.delete(method.toLowerCase()) ////(1)off method
    conn.hub.on(method, callback)
  }
  // register
  // var t = () => {console.log('aaaa')}
  // HiggsSignalR.register(`http://${document.location.host}/chathub?accessToken=123`,'testmethod',t)
  // async register(hub, method, callback) {
  //   var isExist = this.connStatus.find(s => s.hub.connection.baseUrl === hub)
  //   var connHub =
  //     isExist ||
  //     new signalR.HubConnection(hub, {
  //       transport: this.transport
  //     })
  //   this.addConnectionHub(connHub)
  //   connHub.hub.on(method, msg => {
  //     callback()
  //   })
  //   // return this.connStatus.hub
  // }
}

/*************** Sample ****************/
var _hub = new HiggsSignalR()
function test(url) {
  var GetMsg = msg => {
    console.log('SendMsgConsole', msg)
    addLine('message-list', msg)
  }
  var SendMsgConsole = msg => {
    console.log('GetMsg', msg)
    addLine('message-list', msg)
  }

  _hub.register(
    url,
    new _hub.registerClass('GetMsg', GetMsg),
    new _hub.registerClass('SendMsgConsole', SendMsgConsole)
  )

  var ShowLog = () => {
    console.log('ShowLog 2018-04-16')
  }
  _hub.start(url, ShowLog, ShowLog)
}
function testInvokeJoinGroup() {
  _hub.invoke(
    `http://${document.location.host}/chathub?accessToken=123`,
    'JoinGroup',
    'Group01'
  )
  // return ''
}
function testInvokeSendToGroup() {
  _hub.invoke(
    `http://${document.location.host}/chathub?accessToken=123`,
    'SendToGroup',
    'Group01',
    'Hello'
  )
  // return ''
}
function testStop(url) {
  var ShowLog = () => {
    console.log('ShowLog')
  }
  _hub.stop(url, ShowLog, ShowLog)
  // return ''
}
