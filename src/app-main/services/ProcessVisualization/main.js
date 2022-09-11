const { ipcRenderer } = require("electron")

const ProcessListUl = document.querySelector(".process_list")
let AfterMergerProcessAllInfo = null

getProcessAllInfo()

// 从主进程获取进程集合表
async function getProcessAllInfo() {
    const AppMetrics = await ipcRenderer.invoke("getAppMetrics")
    const ProcessAllPIDCorrespondMarkMap = await ipcRenderer.invoke("getProcessAllPIDCorrespondMarkMap")

    for (let i = 0; i < AppMetrics.length; i++) {
        /**
         * 拼接对象信息部分
         */
        const Process = AppMetrics[i]
        Object.assign(Process, ProcessAllPIDCorrespondMarkMap[Process.pid])
        /**
         * 调换信息
         */
        ProcessAllPIDCorrespondMarkMap[Process.pid] = Process

        /**
         * 渲染部分
         */
        renderProcessLiEle(Process)
    }

    AfterMergerProcessAllInfo = AppMetrics
}

/**
 * 定时更新数据
 */
setInterval(async () => {
    const AppMetrics = await ipcRenderer.invoke("getAppMetrics")

    for (let i = 0; i < AppMetrics.length; i++) {
        const Process = AppMetrics[i]
        const liEle = document.querySelector(`li[data-pid="${Process.pid}"]`)
        if (liEle) {
            console.dir(liEle)
            console.dir(liEle.children)
            liEle.children[liEle.children.length - 1].innerHTML = Math.floor(Process.cpu.percentCPUUsage)
            liEle.children[liEle.children.length - 2].innerHTML = Math.floor(Process.memory.workingSetSize / 1000)
        } else {
            renderProcessLiEle(Process)
        }
    }
}, 1000)

function renderProcessLiEle(Process) {
    const processElement = document.createElement("li")
    processElement.setAttribute("data-pid", Process.pid)
    processElement.innerHTML = `
        <span title="${Process.URL}">${Process.URL ?? "none"}</span>
        <span>${Process.mark ?? "none"}</span>
        <span>${Process.type ?? "none"}</span>
        <span>${Process.pid}</span>
        <span>${Math.floor(Process.memory.workingSetSize / 1000)}</span>
        <span>${Math.floor(Process.cpu.percentCPUUsage)}</span>
    `

    ProcessListUl.appendChild(processElement)
}

/**
 * 为了确保数据是响应式更新的，这里的设计是当服务进程启动的时候开启定时器，每一秒就向主进程获取进程数据
 * 如果有变动就改变数据
 */
// setInterval(() => {
//     getProcessAllInfo()
// }, 1000)
