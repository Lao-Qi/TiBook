import axios from "axios"

// 所有使用该文件发送出现的请求，都有下面属性
export default axios.create({
    // 请求地址
    baseURL: `http://127.0.0.1:8080/`,
    // 超时时间
    timeout: 3000,
})
