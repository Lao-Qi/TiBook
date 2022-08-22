const typeIconMap = {
    error: `
    <svg width="20" height="20" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M24 44C35.0457 44 44 35.0457 44 24C44 12.9543 35.0457 4 24 4C12.9543 4 4 12.9543 4 24C4 35.0457 12.9543 44 24 44Z" fill="#e53d3d" stroke="#e53d3d" stroke-width="4" stroke-linejoin="round" />
        <path d="M29.6567 18.3432L18.343 29.6569" stroke="#FFF" stroke-width="4" stroke-linecap="round" stroke-linejoin="round" />
        <path d="M18.3433 18.3432L29.657 29.6569" stroke="#FFF" stroke-width="4" stroke-linecap="round" stroke-linejoin="round" />
    </svg>
    `,
    success: `
    <svg width="20" height="20" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M24 44C29.5228 44 34.5228 41.7614 38.1421 38.1421C41.7614 34.5228 44 29.5228 44 24C44 18.4772 41.7614 13.4772 38.1421 9.85786C34.5228 6.23858 29.5228 4 24 4C18.4772 4 13.4772 6.23858 9.85786 9.85786C6.23858 13.4772 4 18.4772 4 24C4 29.5228 6.23858 34.5228 9.85786 38.1421C13.4772 41.7614 18.4772 44 24 44Z" fill="#54ff18" stroke="#64d32a" stroke-width="4" stroke-linejoin="round" />
        <path d="M16 24L22 30L34 18" stroke="#FFF" stroke-width="4" stroke-linecap="round" stroke-linejoin="round" />
    </svg>
    `,
    info: `
    <svg width="20" height="20" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M24 44C29.5228 44 34.5228 41.7614 38.1421 38.1421C41.7614 34.5228 44 29.5228 44 24C44 18.4772 41.7614 13.4772 38.1421 9.85786C34.5228 6.23858 29.5228 4 24 4C18.4772 4 13.4772 6.23858 9.85786 9.85786C6.23858 13.4772 4 18.4772 4 24C4 29.5228 6.23858 34.5228 9.85786 38.1421C13.4772 41.7614 18.4772 44 24 44Z" fill="#7c7c7c" stroke="#7c7c7c" stroke-width="4" stroke-linejoin="bevel"/>
        <path fill-rule="evenodd" clip-rule="evenodd" d="M24 11C25.3807 11 26.5 12.1193 26.5 13.5C26.5 14.8807 25.3807 16 24 16C22.6193 16 21.5 14.8807 21.5 13.5C21.5 12.1193 22.6193 11 24 11Z" fill="#FFF"/><path d="M24.5 34V20H23.5H22.5" stroke="#FFF" stroke-width="4" stroke-linecap="square" stroke-linejoin="bevel"/><path d="M21 34H28" stroke="#FFF" stroke-width="4" stroke-linecap="square" stroke-linejoin="bevel"/>
    </svg>
    `,
    warn: `
    <svg width="20" height="20" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M24 44C29.5228 44 34.5228 41.7614 38.1421 38.1421C41.7614 34.5228 44 29.5228 44 24C44 18.4772 41.7614 13.4772 38.1421 9.85786C34.5228 6.23858 29.5228 4 24 4C18.4772 4 13.4772 6.23858 9.85786 9.85786C6.23858 13.4772 4 18.4772 4 24C4 29.5228 6.23858 34.5228 9.85786 38.1421C13.4772 41.7614 18.4772 44 24 44Z" fill="#e0e02b" stroke="#e0e02b" stroke-width="4" stroke-linejoin="bevel" />
        <path fill-rule="evenodd" clip-rule="evenodd" d="M24 37C25.3807 37 26.5 35.8807 26.5 34.5C26.5 33.1193 25.3807 32 24 32C22.6193 32 21.5 33.1193 21.5 34.5C21.5 35.8807 22.6193 37 24 37Z" fill="#FFF" />
        <path d="M24 12V28" stroke="#FFF" stroke-width="4" stroke-linecap="square" stroke-linejoin="bevel" />
    </svg>
    `
}

const closeIcon = `
<svg width="24" height="24" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M14 14L34 34" stroke="#7f7f7f" stroke-width="4" stroke-linecap="round" stroke-linejoin="round" />
    <path d="M14 34L34 14" stroke="#7f7f7f" stroke-width="4" stroke-linecap="round" stroke-linejoin="round" />
</svg>
`
// 所有的弹窗通知集合表
const NotificationPopupList = []

/**
 * 软件内部的通知弹窗
 * @param {{
 * type: {string | number},
 * title: {string},
 * content: {string},
 * duration: {number}
 * }} option type 类型 duration 显示时间 单位为秒
 *
 * @returns {Promise<Function>}
 */
export default async function Notification({ type = "info", title, content }) {
    if (typeof type === "number") {
        type = type === 200 ? "success" : "error"
    }

    const notificationPopup = document.createElement("div")
    const notificationCloseIcon = document.createElement("li")

    notificationPopup.classList.add("notification-popup")
    notificationPopup.innerHTML = `
    <div class="notification_state">${typeIconMap[type]}</div>
    <div class="notification_content_container">
        <h2 class="notification_title">${title}</h2>
        <div class="notification_content"><p>${content}</p></div>
    </div>
    `

    notificationCloseIcon.classList.add("notification_close_icon")
    notificationCloseIcon.innerHTML = closeIcon

    // 获取当前数组的长度，作为本次通知弹窗的位置
    const seat = NotificationPopupList.length
    notificationPopup.style.bottom = seat * 80 + 40 + (seat > 0 ? seat * 20 : 0) + "px"
    notificationPopup.style.zIndex = 1000 + seat + 1
    notificationPopup.setAttribute("data-seat", seat)

    notificationPopup.appendChild(notificationCloseIcon)
    // 页面和内存中都添加元素
    NotificationPopupList.push(notificationPopup)
    document.body.appendChild(notificationPopup)

    // 点击关闭按钮则从页面上删除弹窗和从NotificationPopupList中删除元素
    notificationCloseIcon.addEventListener("click", event => {
        // 获取要删除的元素位于当前页面上的弹窗元素列表中的位置
        const seat = event.target.getAttribute("data-seat")
        document.body.removeChild(notificationPopup)
        NotificationPopupList.splice(seat, 1)

        for (const [seat, notificationPopup] of Object.entries(NotificationPopupList)) {
            // 更新所有元素位于弹窗元素列表中的位置
            notificationPopup.setAttribute("data-seat", seat)
            notificationPopup.style.bottom = seat * 80 + 40 + (seat > 0 ? seat * 20 : 0) + "px"
            notificationPopup.style.zIndex = 1000 + parseInt(seat) + 1
        }
    })

    setTimeout(() => {
        notificationCloseIcon.click()
    }, 4800)

    // 返回弹窗的关闭函数
    return notificationCloseIcon.click
}
