/*
 * JavaScript and TypeScript clients for SignalR for ASP.NET Core
 * library for signalr Dependents signalr.js -version preview1-1.0.0
 * 2018-04-16
 * @
 */
var HiggsSignalR = {
    transport: signalR.TransportType.WebSockets,
    connections: [],
    connection: class {
        constructor(status, hub) {
            this.status = status
            this.hub = hub
        }
    },
    getConnectionHub: function(connectionHub) {
        return this.connections.find(s => s.hub == connectionHub)
    },
    addConnectionHub: function(connectionHub) {
        var conn = this.getConnectionHub(connectionHub)
        if (this.conn) {
            if (!this.conn.status) {
                this.connections.splice(this.connections.findIndex(s => s.hub === connectionHub), 1)
                this.connections.push(new this.connection(true, connectionHub))
            }
        } else {
            this.connections.push(new this.connection(true, connectionHub))
        }
    },
    //regist
    regist: function(hub, method, callback) {
        var connHub = new signalR.HubConnection(hub, {
            transport: transport
        })
        connHub.on(method, msg => {
            callback()
        })
    },
    //connecting the server to the signalr hub
    start: function() {
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
    },
    //connecting the server to the signalr hub
    stop: function() {
        connection
            .stop()
            .then(() => {
                console.log('stop')
                isConnected = false
            })
            .catch(err => {
                addLine('message-list', err, 'red')
            })
    },
    retry: function() {
        //reconnect
    },
    //connecting the server to the signalr hub
    invoke: function() {
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
    },
}
