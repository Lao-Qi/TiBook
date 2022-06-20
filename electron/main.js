'use strict';
const { app } = require("electron");
const Store = require("electron-store");
const createMainWin = require("./windows/mainWin");
const { GetPublicKey, LoginUser} = require("./tool/ServerRequire");


const [account, pwd] = ["2231675321", "2231675321"];

app.whenReady().then(async () => {
	// 本地存储
	const UserStore = new Store({ accessPropertiesByDotNotation: false });
	const PublicKey = await GetPublicKey();
	// 更新本地存储的服务器公钥
	UserStore.set("publicKey", PublicKey);
	// 登录测试用户
	const LoginData = await LoginUser(account, pwd, PublicKey);
	// 将返回的token进行本地存储
	UserStore.set("token", LoginData.token);
	// 创建主窗口
	createMainWin(account);
})