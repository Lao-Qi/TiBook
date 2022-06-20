const { default: axios } = require("axios");

module.exports = axios.create({
	baseURL: "http://localhost:8080",
	timeout: 5000,
	// 跨域请求需要携带凭证(cookie)
	withCredentials: true
})