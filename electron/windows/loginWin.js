const { BrowserWindow, ipcMain } = require("electron");
const Store = require("electron-store");
const { RegisterUser, LoginUser } = require("../tool/ServerRequire");

module.exports = async function createLoginWin() {
	const loginWin = new BrowserWindow({
		width: 800,
		height: 600,
		maxWidth: 1000,
		maxHeight: 800,
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

	const UserStore = new Store({ accessPropertiesByDotNotation: false })

	ipcMain.on("register", async (event, { account, paw }) => {
		const registerData = await RegisterUser(name, account, paw);
	})
	ipcMain.on("login", async (event, { account, paw }) => {
		const loginUserData = await LoginUser(account, paw);
		if(loginUserData.code === 200) {
			UserStore.set("token", loginUserData.token);
		}
		loginWin.webContents.send("login message", loginUserData);
	})




	loginWin.once("ready-to-show",  () => loginWin.show());
	ipcMain.on("loginWin-destroy", () => loginWin.destroy());
	ipcMain.on("loginWin-minimize", () => loginWin.minimize());
	ipcMain.on("loginWin-maximize", () => loginWin.isMaximized() ? loginWin.unmaximize() : loginWin.maximize());
	loginWin.on("maximize", () => loginWin.webContents.send("loginWin-maximize"));
	loginWin.on("unmaximize", () => loginWin.webContents.send("loginWin-unmaximize"));

	return loginWin;
}