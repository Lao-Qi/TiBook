const { join } = require("path")

module.exports = [
    {
        /** 工具进程的入口文件 */
        path: join(__dirname, "./tools/LocalOperation.js"),
        /** 进程标识 */
        mark: "localOperation",
        /**
         * 渲染进程向工具进程发送的消息所需要的事件
         * 事件参数: renderMark[ 渲染进程的标识 string ] operate[ 要操作的方法 string ] args[ 方法的参数 ...array ]
         */
        sendOperateEvent: "local-operation-operate-send",
        /** 通过渲染进程发送的操作方法返回的数据将触发此事件发送到渲染进程 */
        operationResultReturnEvent: "local-operation-operate-reveive",
        /**
         * 监听工具进程主动发出的事件，需要先触发listenerEvent告知主进程哪个渲染进程正在监听此工具进程的哪个主动事件
         * 事件参数: renderMark[ 渲染进程的标识 string ] event[ 要监听的事件 string ]
         */
        listenerProactiveEvent: "listener-local-operation-proactive-event",
        /** 进程中因各种原因主动发出的信息，渲染进程可绑定此事件来接收信息，[ 需要先发送listenerEvent才会触发proactiveSendEvent ] */
        proactiveSendEvent: "local-operation-proactive-send",
        /** 在渲染进程中的调用对象名称，[可选，如果不配置将使用mark] */
        // renderName: "LocalOperation",
        /** 事件的启动类型 auto[自动启动] | event[事件启动]  default[auto] */
        startMethod: "auto"
    },
    {
        path: join(__dirname, "./tools/ServerRequest.js"),
        mark: "serverRequest",
        sendOperateEvent: "server-request-operate-send",
        operationResultReturnEvent: "server-request-operate-reveive",
        listenerProactiveEvent: "listener-server-request-proactive-event",
        proactiveSendEvent: "server-request-proactive-send"
    },
    {
        path: join(__dirname, "./tools/SocketCommunicate.js"),
        mark: "socketCommunicate",
        sendOperateEvent: "socket-communicate-send",
        operationResultReturnEvent: "socket-communicate-operate-reveive",
        listenerProactiveEvent: "listener-socket-communicate-proactive-event",
        proactiveSendEvent: "socket-communicate-proactive-send",
        startMethod: "event"
    }
]
