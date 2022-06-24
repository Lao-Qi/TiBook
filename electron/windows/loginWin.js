const { BrowserWindow, ipcMain } = require("electron");
const Store = require("electron-store");
const { RegisterUser, LoginUser } = require("../tool/ServerRequire");

module.exports = async function createLoginWin() {
	const loginWin = new BrowserWindow({
		width: 800,
		height: 600,
		minWidth: 600,
		minHeight: 400,
		show: false,
		frame: false,
		webPreferences: {
			nodeIntegration: true,
			contextIsolation: false,
			webSecurity: false // 支持不同协议的资源
		}
	})

	loginWin.loadURL("http://127.0.0.1:3000/#/login");
	loginWin.once("ready-to-show",  () => loginWin.show());

	const UserStore = new Store({ accessPropertiesByDotNotation: false })

	ipcMain.on("register", async (event, { name, account, paw }) => {
		const registerData = await RegisterUser(name, account, paw);
		if(registerData.code === 200) {}
	})

	ipcMain.on("login", async (event, { account, paw }) => {
		const loginUserData = await LoginUser(account, paw);
		if(loginUserData.code === 200) {
			UserStore.set("token", loginUserData.token);
		}
		loginWin.webContents.send("login message", loginUserData);
	})


	return loginWin;
}