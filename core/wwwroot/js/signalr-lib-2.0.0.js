/*
 * JavaScript and TypeScript clients for SignalR for ASP.NET Core
 * library for signalr Dependents signalr.js -version 1.0.0-rc1-update1
 * 2018-05-28
 * 
 * @ HiggsSignalR.mulRegister
 * @ HiggsSignalR.start
 * @ HiggsSignalR.invoke
 * @ HiggsSignalR.stop
 */

const HiggsSignalR = class {
    constructor() {
        this.transport = WebSocket ? signalR.HttpTransportType.WebSockets : {}
        // 連線狀態
        this.ConnectionStatus = Object.freeze({
            Connected: 1,
            Disconnected: 2,
            Error: 3
        })
        this.connections = {} //所有hub連線
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
    getAllConn() {
        console.log('all hub data', this.connections)
    }
    async register(hub, ...regArg) {
        var hubData = this.connections[hub]
        var connHub =
            hubData ||
            new signalR.HubConnectionBuilder()
                .withUrl("http://localhost:49351/chat?accessToken=123")
                .build()
        //new signalR.HubConnection(hub, {
        //  transport: this.transport
        //})
        this.addConnectionHub(connHub)
        var argsArray = Array.prototype.slice.call(arguments).slice(1)
        var _isStop = hubData && hubData.isStop //已存在的hub而且手動關閉過
        for (let element of argsArray) {
            if (element instanceof this.registerClass) {
                //一律註冊，除非手動關閉過
                if (_isStop) {
                    hubData.isStop = false
                    this.resetOn(
                        hubData.hub.connection.baseUrl,
                        element.method,
                        element.callback
                    )
                } else {
                    connHub.hub
                        ? connHub.hub.on(element.method, element.callback)
                        : connHub.on(element.method, element.callback)
                }
                /** old logic **/
                // if (!hubData) {
                //   // 如果已存在該連線，則刪除再加入
                //   // 否則會造成合併method內容
                //   connHub.on(element.method, element.callback)
                // } else {
                //   this.resetOn(
                //     hubData.hub.connection.baseUrl,
                //     element.method,
                //     element.callback
                //   )
                // }
            }
        }
        var onClose = hubData ? hubData.hub : connHub
        // (1) 斷線時connHub
        onClose.connection.onclose = e => {
            console.log('disconnected', e)
            var hubData = connHub.hub || this.connections[connHub.connection.baseUrl]
            if (hubData) {
                // 不是人為關閉的情況
                if (
                    !hubData.isStop &&
                    hubData.hub.connection.connectionState !== this.ConnectionStatus.Connected
                ) {
                    this.retry(connHub)
                }
            }
        }
    }
    async start(hub, callback, error) {
        var conn = this.connections[hub]
        if (!conn) {
            conn = this.connections[hub.connection.baseUrl]
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
                // console.log(err)
                // error ? error() : conn.error()
            })
    }
    // connecting the server to the signalr hub
    async invoke(hub, method, ...args) {
        var conn = this.connections[hub]

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
    }
    async stop(hub, callback, error) {
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
    }
    getConnStatus(hubBaseUrl) {
        return this.connections[hubBaseUrl]
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
        console.log('all hub data', this.connections)
    }
    // 300ms檢查一次 | check status === 3 才retry
    // Connecting = 0 ; Connected = 1 ; Disconnected = 2 (新的
    // onnecting: 0, connected: 1, reconnecting: 2, disconnected: 4 (舊的
    // 手動關閉的設定一個flag不要檢查上面那個條件
    // (3)
    async retry(connHub) {
        console.log('connHub', connHub)
        console.log('retry')
        var conn = this.connections[connHub.connection.baseUrl]
        //setTimer
        while (
            conn.retryTimes < 3 &&
            conn.hub.connection.connectionState !== this.ConnectionStatus.Connected
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
    async resetOn(hub, method, callback) {
        var conn = this.connections[hub]
        conn.hub.methods.delete(method.toLowerCase()) ////(1)off method
        conn.hub.on(method, callback)
    }
    async removeMethod(hub, methodName) {
        var conn = this.connections[hub]
        conn.hub.methods.delete(methodName.toLowerCase()) ////(1)remove method
    }
}

/*************  05-28  ************** */

var _test = new HiggsSignalR()

var GetMsg = msg => {
    console.log('SendMsgConsole-2', msg)
    //     addLine('message-list-2', msg)
}
var send = data => {
    console.log('send', data)
    // addLine('message-list-2', msg)
}
var SendMsgConsole = msg => {
    console.log('GetMsg-2', msg)
    // addLine('message-list-2', msg)
}

_test.register(
    'http://localhost:49351/chat?accessToken=123',
    new _test.registerClass('GetMsg', GetMsg),
    new _test.registerClass('SendMsgConsole', SendMsgConsole)
)

_test.start('http://localhost:49351/chat?accessToken=123')

/*************** Sample ****************/

function test0426() {
    var GetMsg = msg => {
        console.log('SendMsgConsole-2', msg)
        addLine('message-list-2', msg)
    }
    var SendMsgConsole = msg => {
        console.log('GetMsg-2', msg)
        addLine('message-list-2', msg)
    }
    // 多註冊兩個method
    _hub.register(
        'http://localhost:49351/chat?accessToken=123',
        new _hub.registerClass('A.a', GetMsg),
        new _hub.registerClass('A.b', SendMsgConsole)
    )
    // 同名稱做不同的事情
    _hub.register(
        'http://localhost:49351/chat?accessToken=123',
        new _hub.registerClass('GetMsg', GetMsg),
        new _hub.registerClass('SendMsgConsole', SendMsgConsole)
    )
    // 如何一起刪除A.開頭的 = =?
    _hub.removeMethod('http://localhost:49351/chat?accessToken=123', 'A')
}

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
    //_hub.start(url, ShowLog, ShowLog)
}
function testInvokeJoinGroup() {
    _hub.invoke(
        `http://localhost:49351/chat?accessToken=123`,
        'JoinGroup',
        'Group01'
    )
    // return ''
}
function testInvokeSendToGroup() {
    _hub.invoke(
        `http://localhost:49351/chat?accessToken=123`,
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

