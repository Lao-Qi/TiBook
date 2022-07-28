const { ipcRenderer } = require("electron")

const exhibitListContainer = document.querySelector(".process_list")
const currentState = document.querySelector(".menu>span")
const PROCESS = {
    AllInfo: null,
    current: null
}

// 字段的顺序表
const FieldOrder = {
    URL: 0,
    PID: 1,
    OSPID: 2,
    Mark: 3,
    Memory: 4,
    CPU: 5
}

const optionsMenu = {
    close: "关闭",
    openDevTools: "打开devTools",
    reload: "重启",
    reloadAll: "重启全部"
}

renderOptionMenu(optionsMenu)
renderFieldTableHead(FieldOrder)

// 从主进程获取进程集合表
ipcRenderer.invoke("getProcessAllInfo").then(ProcessAllInfo => {
    PROCESS.AllInfo = ProcessAllInfo
    ProcessAllInfo.forEach(processInfo => {
        renderProcessLi(processInfo)
    })
})
/**
 * 为了确保数据是响应式更新的，这里的设计是当服务进程启动的时候开启定时器，每一秒就向主进程获取进程数据
 * 如果有变动就改变数据
 */
setInterval(() => {
    ipcRenderer.invoke("getProcessAllInfo").then(ProcessAllInfo => {
        PROCESS.AllInfo = ProcessAllInfo
        ProcessAllInfo.forEach(processInfo => {
            const MemoryBox = document.querySelector(`li[data-pid="${processInfo.PID}"]>span:nth-last-child(2)`)
            const CPUBOX = document.querySelector(`li[data-pid="${processInfo.PID}"]>span:nth-last-child(1)`)
            if (MemoryBox && CPUBOX) {
                MemoryBox.innerHTML = processInfo["Memory"]
                CPUBOX.innerHTML = processInfo["CPU"]
            } else {
                renderProcessLi(processInfo)
            }
        })
    })
}, 1000)

/**
 * 渲染进程数据
 * @param {any} processInfo
 */
function renderProcessLi(processInfo) {
    const infoAry = []
    // 排序字段
    Object.keys(processInfo).forEach(key => {
        infoAry[FieldOrder[key]] = processInfo[key]
    })

    const li = document.createElement("li")
    li.setAttribute("data-pid", processInfo.PID)

    /**
     * const a = [1, 2, 3]
     *
     * a.join("</span><span>") === 1</span><span>2</span><span>3
     *
     * `<span>${"1</span><span>2</span><span>3"}</span>`
     *
     * 顺便为第一个span添加title，鼠标停止上面可以显示完整路径
     */
    li.innerHTML = `<span title="${infoAry[0]}">${infoAry.join("</span><span>")}</span>`
    exhibitListContainer.appendChild(li)
    li.onclick = function () {
        /**
         * 当进程被选中时判断是否和上一个进程一致，如果一致，则取消选中进程
         *
         * 如果不一致，则切换选中进程
         */
        const upCurrentProcess = document.querySelector(".current_process")
        if (upCurrentProcess && upCurrentProcess.getAttribute("data-PID") === processInfo.PID) {
            this.setAttribute("class", "")
            PROCESS.current = null
            currentState.innerHTML = "当前无选中进程"
        } else {
            for (let i = 0; i < exhibitListContainer.children.length; i++) {
                exhibitListContainer.children[i].setAttribute("class", "")
            }
            PROCESS.current = processInfo
            currentState.innerHTML = `选中进程PID: ${PROCESS.current.PID}`
            this.setAttribute("class", "current_process")
        }
    }
}

/**
 * 渲染进程操作选项
 * @param {any} optionsMenu
 */
function renderOptionMenu(optionsMenu) {
    const menuBox = document.querySelector(".menu>.controls")
    Object.keys(optionsMenu).forEach(key => {
        const a = document.createElement("a")
        a.href = "javascript:;"
        a.setAttribute("data-operate", key)
        a.innerText = optionsMenu[key]
        menuBox.appendChild(a)

        /**
         * 当操作按钮选中时，检查是否有已选中进程，如果有，则获取该操作按钮的操作类型
         * 并直接当作选中的进程对象的方法名，直接调用。当然，前提是选中的不是重启全部按钮
         *
         * 如果没有则弹出提示框
         */
        a.onclick = function () {
            if (PROCESS.current) {
                const operate = this.getAttribute("data-operate")
                if (operate === "reloadAll") {
                    ipcRenderer.send("operateProcessAllReload")
                } else {
                    ipcRenderer.invoke("operateProcess", PROCESS.current.PID, operate)
                }
            } else {
                alert("请选择要操作的进程")
            }
        }
    })
}

/**
 * 渲染进程信息字段头
 * @param {any} Field
 */
function renderFieldTableHead(FieldMap) {
    const TableHead = document.querySelector(".process_list_table_head")
    Object.keys(FieldMap).forEach(field => {
        const span = document.createElement("span")
        if (field === "Memory") {
            span.innerText = field + "(MB)"
        } else if (field === "CPU") {
            span.innerText = field + "(%)"
        } else {
            span.innerText = field
        }
        TableHead.appendChild(span)
    })
}
